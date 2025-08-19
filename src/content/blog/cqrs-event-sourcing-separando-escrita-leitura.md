---
title: 'CQRS + Event Sourcing: Separando Escrita e Leitura com Eventos'
description: 'Implementação prática de CQRS e Event Sourcing em Java: comandos, consultas e eventos imutáveis para sistemas distribuídos complexos.'
pubDate: 'Jan 3 2025'
tags: ['arquitetura', 'cqrs', 'event-sourcing', 'sistemas-distribuidos', 'java']
---

## Introdução

Em sistemas de negócio complexos, a mesma entidade costuma ter necessidades diferentes para **escrita** (regras complexas, validações, auditoria) e **leitura** (velocidade, relatórios, dashboards).

**CQRS** (Command Query Responsibility Segregation) propõe separar esses dois mundos.

**Event Sourcing** (ES) registra mudanças como eventos imutáveis em vez de sobrescrever o estado atual.

Usados juntos, entregam: **rastreabilidade completa**, **reprocessamento do estado** e **liberdade para otimizar** leitura e escrita independentemente.

## Para quem está começando: explicação simples

Antes de mergulhar nos detalhes técnicos, vamos entender esses conceitos usando analogias do dia a dia.

### Imagine um banco tradicional vs um banco moderno

**Banco Tradicional (Sistema Antigo)**
- **Uma única fila**: Você vai ao banco e tem UMA fila só para TUDO - sacar, depositar, consultar saldo, pedir extrato
- **Mesmo funcionário**: A mesma pessoa que conta dinheiro também imprime relatórios
- **Problema**: Se alguém demora para contar R$ 50.000 em notas, todo mundo espera, até quem só quer ver o saldo

**Banco Moderno (CQRS + Event Sourcing)**
- **Duas filas separadas**: 
  - **Fila rápida**: Só para ver saldo, extratos (LEITURA)
  - **Fila especial**: Para operações como transferências, saques (ESCRITA)
- **Funcionários especializados**: Quem conta dinheiro não imprime relatório
- **Resultado**: Você consulta saldo instantaneamente, mesmo se alguém estiver fazendo operação complexa

### CQRS = Separar "Fazer" de "Ver"

**CQRS** significa "separar comandos (fazer coisas) de consultas (ver coisas)":

- **COMANDO**: "Transfira R$ 1.000 para João" (demora, tem regras, pode dar erro)
- **CONSULTA**: "Qual meu saldo?" (rápido, só mostrar)

**Por que separar?**
- Ver saldo não deve travar porque alguém está fazendo transferência
- Cada um tem necessidades diferentes: ver precisa ser rápido, fazer precisa ser seguro

### Event Sourcing = Caderninho de Anotações

Imagine que em vez de apagar e reescrever, você **sempre adiciona** no caderninho:

**Sistema Tradicional** (problemático)
```
Conta João: R$ 1.000
[João deposita R$ 500]
Conta João: R$ 1.500 ← (apagou o R$ 1.000)
```
**Problema**: Perdeu o histórico! Não sabe mais que tinha R$ 1.000

**Event Sourcing** (recomendado)
```
Evento 1: João abriu conta
Evento 2: João depositou R$ 1.000  
Evento 3: João depositou R$ 500
Saldo atual = soma tudo = R$ 1.500
```
**Vantagem**: Tem TODA a história! Pode "voltar no tempo"

### Por que isso é valioso?

1. **Auditoria Total**: "Por que cobraram essa tarifa?" → Olha o histórico de eventos
2. **Múltiplas Visões**: Cliente vê extrato, BACEN vê relatório, gerente vê dashboard
3. **"Máquina do Tempo"**: Pode reprocessar tudo se mudou alguma regra
4. **Performance**: Ver dados é super rápido, não compete com operações complexas

### Quando usar?

**NÃO use para**: Lista de contatos, cadastro simples, blog pessoal  
**SIM use para**: Sistema bancário, plataformas financeiras, sistemas que precisam de auditoria rigorosa

> **Resumo**: É como ter um caderninho que nunca apaga nada (Event Sourcing) e balcões separados para operações rápidas e lentas (CQRS)

Agora que você entendeu o conceito geral, vamos aos detalhes técnicos!

---

## Conceitos técnicos

**CQRS**: uma rota de escrita (Commands → validações → mudanças) e uma rota de leitura (Queries → modelos otimizados para consulta).

**Event Sourcing**: o estado de um agregado é a soma de todos os eventos aplicados a ele; para "atualizar", você acrescenta um novo evento ao event store.

## Arquitetura (visão geral)

```mermaid
flowchart LR
    subgraph Write["Write Side (CQRS + ES)"]
        UIW[API - Commands] --> CH[Command Handler]
        CH --> V[Validações/Regra de Negócio]
        V --> ES[(Event Store)]
        ES --> EB[Event Bus/Log]
    end

    subgraph Read["Read Side"]
        EB --> P1[Projeção A<br/>SQL]
        EB --> P2[Projeção B<br/>NoSQL/Cache]
        P1 --> Q1[API - Queries]
        P2 --> Q1
    end
    
    style Write fill:#e1f5fe
    style Read fill:#f3e5f5
    style ES fill:#fff3e0
    style EB fill:#e8f5e8
```

- **Event Store** é a fonte de verdade para escrita
- **Projeções** materializam visões de leitura (ex.: Postgres, Elastic, Redis), atualizadas de forma assíncrona ao consumir eventos

## Fluxo de escrita (Command → Eventos)

```mermaid
sequenceDiagram
    participant C as Cliente/API
    participant CH as Command Handler
    participant CONTA as ContaBancaria
    participant ES as Event Store
    
    C->>CH: RealizarTransferenciaCommand
    CH->>CONTA: validações + regras bancárias
    CONTA-->>CH: DomainEvents
    CH->>ES: append(events)
    ES-->>CH: ok (offset/version)
```

## Fluxo de leitura (Projeção → Query)

```mermaid
sequenceDiagram
    participant ES as Event Store / Bus
    participant PR as Projeção (Read Model)
    participant API as API - Queries
    
    ES-->>PR: ContaAberta, TransferenciaRealizada, TarifaCobrada...
    PR->>PR: atualiza extrato e saldos
    API->>PR: GET /extrato?contaId=...
    PR-->>API: JSON (rápido, indexado)
```

## Exemplo prático em Java (sem framework específico)

### Enums e Value Objects

```java
public enum TipoConta {
    CORRENTE, POUPANCA, PREMIUM
}

public enum TipoTransferencia {
    TED, DOC, PIX
}
```

### Eventos de domínio

```java
public interface DomainEvent {
    String aggregateId();
    Instant occurredAt();
    String userId(); // Para auditoria bancária
}

// Eventos bancários
public record ContaAberta(String aggregateId, String clienteId, TipoConta tipo, Instant occurredAt, String userId) implements DomainEvent {}
public record TransferenciaRealizada(String aggregateId, String contaDestino, BigDecimal valor, TipoTransferencia tipo, Instant occurredAt, String userId) implements DomainEvent {}
public record TarifaCobrada(String aggregateId, String tarifaId, BigDecimal valor, String descricao, Instant occurredAt, String userId) implements DomainEvent {}
```

### Comandos

```java
public interface Command {
    String userId(); // Para auditoria
}

public record AbrirConta(String contaId, String clienteId, TipoConta tipo, String userId) implements Command {}
public record RealizarTransferencia(String contaId, String contaDestino, BigDecimal valor, TipoTransferencia tipo, String userId) implements Command {}
public record CobrarTarifa(String contaId, String tarifaId, BigDecimal valor, String descricao, String userId) implements Command {}
```

### Agregado com Event Sourcing

```java
public class ContaBancaria {

    private String contaId;
    private String clienteId;
    private TipoConta tipoConta;
    private BigDecimal saldo;
    private boolean contaAtiva;
    private List<String> transferenciasRealizadas = new ArrayList<>();

    // "Aplica" eventos para reconstruir estado
    public void apply(DomainEvent event) {
        if (event instanceof ContaAberta e) {
            this.contaId = e.aggregateId();
            this.clienteId = e.clienteId();
            this.tipoConta = e.tipo();
            this.saldo = BigDecimal.ZERO;
            this.contaAtiva = true;
        } else if (event instanceof TransferenciaRealizada e) {
            this.saldo = this.saldo.subtract(e.valor());
            this.transferenciasRealizadas.add(e.contaDestino());
        } else if (event instanceof TarifaCobrada e) {
            this.saldo = this.saldo.subtract(e.valor());
        }
    }

    // Regras de negócio bancário que emitem novos eventos
    public List<DomainEvent> abrirConta(String contaId, String clienteId, TipoConta tipo, String userId) {
        if (this.contaId != null) throw new IllegalStateException("Conta já existe");
        return List.of(new ContaAberta(contaId, clienteId, tipo, Instant.now(), userId));
    }

    public List<DomainEvent> realizarTransferencia(String contaDestino, BigDecimal valor, TipoTransferencia tipo, String userId) {
        if (!contaAtiva) throw new IllegalStateException("Conta inativa");
        if (saldo.compareTo(valor) < 0) throw new IllegalStateException("Saldo insuficiente");
        if (valor.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Valor deve ser positivo");
        
        return List.of(new TransferenciaRealizada(contaId, contaDestino, valor, tipo, Instant.now(), userId));
    }

    public List<DomainEvent> cobrarTarifa(String tarifaId, BigDecimal valor, String descricao, String userId) {
        if (!contaAtiva) throw new IllegalStateException("Conta inativa");
        if (saldo.compareTo(valor) < 0) throw new IllegalStateException("Saldo insuficiente para tarifa");
        
        // Regra: Conta premium isenta de tarifas
        if (isPremiumAccount()) {
            return List.of(); // Sem cobrança
        }
        
        return List.of(new TarifaCobrada(contaId, tarifaId, valor, descricao, Instant.now(), userId));
    }
    
    private boolean isPremiumAccount() {
        return tipoConta == TipoConta.PREMIUM || saldo.compareTo(new BigDecimal("50000.00")) >= 0;
    }
}
```

### Event Store (append-only + optimistic locking)

```java
public interface EventStore {
    List<DomainEvent> load(String aggregateId);
    void append(String aggregateId, long expectedVersion, List<DomainEvent> newEvents);
}

public class JdbcEventStore implements EventStore {
    private final DataSource ds;

    public JdbcEventStore(DataSource ds) { this.ds = ds; }

    @Override
    public List<DomainEvent> load(String aggregateId) {
        // SELECT * FROM events WHERE aggregate_id=? ORDER BY version
        // mapear para DomainEvent via type + payload (JSON)
        // (omisso por brevidade)
        return List.of();
    }

    @Override
    public void append(String aggregateId, long expectedVersion, List<DomainEvent> newEvents) {
        try (var conn = ds.getConnection()) {
            conn.setAutoCommit(false);
            
            // Verifica versão atual com lock otimista
            long currentVersion = selectMaxVersionForUpdate(conn, aggregateId); // retorna -1 se novo agregado
            if (currentVersion != expectedVersion - 1) {
                throw new ConcurrencyException("Expected version " + (expectedVersion - 1) + 
                                             " but found " + currentVersion);
            }
            
            // Insere eventos com versão incremental
            long nextVersion = expectedVersion;
            for (var event : newEvents) {
                insertEvent(conn, aggregateId, nextVersion, event);
                nextVersion++;
            }
            
            conn.commit();
        } catch (SQLException e) {
            throw new EventStoreException("Failed to append events", e);
        }
    }
    
    private long selectMaxVersionForUpdate(Connection conn, String aggregateId) throws SQLException {
        try (var stmt = conn.prepareStatement(
            "SELECT COALESCE(MAX(version), -1) FROM events WHERE aggregate_id = ? FOR UPDATE")) {
            stmt.setString(1, aggregateId);
            var rs = stmt.executeQuery();
            return rs.next() ? rs.getLong(1) : -1;
        }
    }
    
    private void insertEvent(Connection conn, String aggregateId, long version, DomainEvent event) throws SQLException {
        try (var stmt = conn.prepareStatement(
            "INSERT INTO events (aggregate_id, version, event_type, payload, occurred_at) VALUES (?, ?, ?, ?, ?)")) {
            stmt.setString(1, aggregateId);
            stmt.setLong(2, version);
            stmt.setString(3, event.getClass().getSimpleName());
            stmt.setString(4, serializeEvent(event)); // JSON
            stmt.setTimestamp(5, Timestamp.from(event.occurredAt()));
            stmt.executeUpdate();
        }
    }
}
```

### Command Handler (reconstitui → valida → persiste eventos)

```java
public class ContaBancariaCommandHandler {

    private final EventStore eventStore;
    private final EventPublisher publisher; // Kafka/NATS/etc.

    public ContaBancariaCommandHandler(EventStore eventStore, EventPublisher publisher) {
        this.eventStore = eventStore;
        this.publisher = publisher;
    }

    public void handle(AbrirConta cmd) {
        var history = eventStore.load(cmd.contaId());
        var conta = rebuild(history);
        var newEvents = conta.abrirConta(cmd.contaId(), cmd.clienteId(), cmd.tipo(), cmd.userId());
        eventStore.append(cmd.contaId(), history.size(), newEvents);
        publisher.publish(newEvents);
    }

    public void handle(RealizarTransferencia cmd) {
        var history = eventStore.load(cmd.contaId());
        var conta = rebuild(history);
        var newEvents = conta.realizarTransferencia(cmd.contaDestino(), cmd.valor(), cmd.tipo(), cmd.userId());
        eventStore.append(cmd.contaId(), history.size(), newEvents);
        publisher.publish(newEvents);
    }

    public void handle(CobrarTarifa cmd) {
        var history = eventStore.load(cmd.contaId());
        var conta = rebuild(history);
        var newEvents = conta.cobrarTarifa(cmd.tarifaId(), cmd.valor(), cmd.descricao(), cmd.userId());
        eventStore.append(cmd.contaId(), history.size(), newEvents);
        publisher.publish(newEvents);
    }

    private ContaBancaria rebuild(List<DomainEvent> history) {
        var conta = new ContaBancaria();
        history.forEach(conta::apply);
        return conta;
    }
}
```

### Projeção (Read Model) em Postgres

**Estrutura normalizada para consultas bancárias eficientes:**

```sql
-- Tabelas otimizadas para leitura bancária
CREATE TABLE contas_read_model (
  conta_id text PRIMARY KEY,
  cliente_id text NOT NULL,
  tipo_conta text NOT NULL,
  saldo_atual decimal(15,2) NOT NULL DEFAULT 0,
  conta_ativa boolean NOT NULL DEFAULT true,
  data_abertura timestamptz NOT NULL
);

CREATE TABLE extrato_conta (
  id serial PRIMARY KEY,
  conta_id text NOT NULL,
  data_transacao timestamptz NOT NULL,
  tipo_operacao text NOT NULL,
  valor decimal(15,2) NOT NULL,
  descricao text NOT NULL,
  saldo_apos decimal(15,2) NOT NULL,
  FOREIGN KEY (conta_id) REFERENCES contas_read_model(conta_id)
);
```

```java
public class ContasProjection {

    private final JdbcTemplate jdbc;

    public ContasProjection(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // Assinando o Event Bus
    public void on(ContaAberta e) {
        jdbc.update("""
          INSERT INTO contas_read_model(conta_id, cliente_id, tipo_conta, saldo_atual, data_abertura)
          VALUES (?, ?, ?, 0, ?)
          ON CONFLICT (conta_id) DO NOTHING
        """, e.aggregateId(), e.clienteId(), e.tipo().name(), e.occurredAt());
    }

    public void on(TransferenciaRealizada e) {
        // Atualiza saldo da conta
        BigDecimal novoSaldo = atualizarSaldo(e.aggregateId(), e.valor().negate());
        
        // Registra no extrato
        jdbc.update("""
          INSERT INTO extrato_conta(conta_id, data_transacao, tipo_operacao, valor, descricao, saldo_apos)
          VALUES (?, ?, 'TRANSFERENCIA_ENVIADA', ?, ?, ?)
        """, e.aggregateId(), e.occurredAt(), e.valor().negate(), 
             "Transferência para conta " + e.contaDestino(), novoSaldo);
    }

    public void on(TarifaCobrada e) {
        // Atualiza saldo da conta
        BigDecimal novoSaldo = atualizarSaldo(e.aggregateId(), e.valor().negate());
        
        // Registra no extrato
        jdbc.update("""
          INSERT INTO extrato_conta(conta_id, data_transacao, tipo_operacao, valor, descricao, saldo_apos)
          VALUES (?, ?, 'TARIFA', ?, ?, ?)
        """, e.aggregateId(), e.occurredAt(), e.valor().negate(), e.descricao(), novoSaldo);
    }
    
    private BigDecimal atualizarSaldo(String contaId, BigDecimal delta) {
        jdbc.update("""
          UPDATE contas_read_model 
          SET saldo_atual = saldo_atual + ? 
          WHERE conta_id = ?
        """, delta, contaId);
        
        return jdbc.queryForObject("""
          SELECT saldo_atual FROM contas_read_model WHERE conta_id = ?
        """, BigDecimal.class, contaId);
    }
}
```

## Exemplo Completo: Cobrança de Tarifa Bancária

Vamos ver um caso prático que demonstra todos os conceitos em ação: cobrança automática de tarifa em uma transferência TED.

### Cenário: Cliente faz TED de R$ 5.000

```java
// Comando para processar transferência com cobrança de tarifa
@Service
public class TransferenciaService {
    
    public TransferenciaResult processarTED(String contaOrigem, String contaDestino, BigDecimal valor) {
        var command = new ProcessarTransferencia(
            UUID.randomUUID().toString(),
            contaOrigem, 
            contaDestino, 
            valor,
            TipoTransferencia.TED,
            "sistema-automatico"
        );
        
        return transferenciaHandler.handle(command);
    }
}

// Command Handler orquestra todo o fluxo
@Component
public class TransferenciaCommandHandler {
    
    public TransferenciaResult handle(ProcessarTransferencia cmd) {
        var eventos = new ArrayList<DomainEvent>();
        
        // 1. Carrega agregado da conta
        var contaHistory = eventStore.load(cmd.contaOrigem());
        var conta = rebuildConta(contaHistory);
        
        // 2. Carrega tarifa aplicável
        var tarifaHistory = eventStore.load("tarifa-ted-001");
        var tarifa = rebuildTarifa(tarifaHistory);
        
        // 3. Calcula valor da tarifa (regras de negócio)
        var valorTarifa = tarifaCalculator.calcular(conta, TipoTransferencia.TED, cmd.valor());
        
        // 4. Gera eventos na ordem correta
        eventos.add(new TransferenciaIniciada(
            cmd.transferenciaId(), cmd.contaOrigem(), cmd.contaDestino(), 
            cmd.valor(), Instant.now(), cmd.userId()
        ));
        
        eventos.add(new TarifaCalculada(
            cmd.transferenciaId(), "tarifa-ted-001", valorTarifa, 
            "TED acima de R$ 1.000", Instant.now(), cmd.userId()
        ));
        
        // 5. Cobra a tarifa (regras de isenção aplicadas aqui)
        var eventosCobranca = conta.chargeTarifa("tarifa-ted-001", valorTarifa, 
                                                TipoOperacao.TRANSFERENCIA_TED, cmd.userId());
        eventos.addAll(eventosCobranca);
        
        // 6. Confirma transferência
        eventos.add(new TransferenciaConfirmada(cmd.transferenciaId(), Instant.now(), cmd.userId()));
        
        // 7. Persiste todos os eventos atomicamente
        eventStore.append(cmd.transferenciaId(), 0, eventos);
        
        // 8. Publica eventos para projeções
        eventPublisher.publish(eventos);
        
        return new TransferenciaResult(cmd.transferenciaId(), valorTarifa);
    }
}
```

### Fluxo completo da cobrança

```mermaid
sequenceDiagram
    participant Cliente as Cliente (App)
    participant API as API Banking
    participant CH as Command Handler  
    participant CONTA as Agregado Conta
    participant TARIFA as Agregado Tarifa
    participant ES as Event Store
    participant EB as Event Bus
    participant PROJ as Projeções
    
    Cliente->>API: POST /transferencias/ted<br/>{valor: 5000, destino: "12345"}
    API->>CH: ProcessarTransferencia command
    CH->>CONTA: rebuild from events
    CH->>TARIFA: get tarifa TED ativa
    CH->>CONTA: calcular + validar tarifa
    CONTA-->>CH: eventos: [TarifaCalculada, TarifaCobrada]
    CH->>ES: append events (atomic)
    ES->>EB: publish events
    EB-->>PROJ: atualiza saldo, extrato, métricas
    CH-->>API: TransferenciaId + tarifa
    API-->>Cliente: {"id": "ted-123", "tarifa": 12.50}
```

### Regras de negócio no agregado

```java
public class ContaBancaria {
    
    private String contaId;
    private String clienteId;
    private BigDecimal saldo;
    private TipoConta tipoConta;
    private LocalDate dataAbertura;
    private int tedGratuitosUsados; // Contador mensal
    
    public List<DomainEvent> chargeTarifa(String tarifaId, BigDecimal valorTarifa, 
                                         TipoOperacao operacao, String userId) {
        
        // Validação de saldo
        if (saldo.compareTo(valorTarifa) < 0) {
            throw new InsufficientFundsException("Saldo insuficiente para cobrança da tarifa");
        }
        
        // Regra 1: Conta premium tem isenção total
        if (isPremiumAccount()) {
            return List.of(new TarifaWaived(contaId, tarifaId, valorTarifa, 
                          "Conta Premium - Isenção automática", Instant.now(), userId));
        }
        
        // Regra 2: Máximo 2 TED gratuitos por mês para conta corrente
        if (operacao == TipoOperacao.TRANSFERENCIA_TED && hasFreeTedAvailable()) {
            incrementTedGratuito();
            return List.of(new TarifaWaived(contaId, tarifaId, valorTarifa, 
                          "TED gratuito mensal", Instant.now(), userId));
        }
        
        // Regra 3: Cliente há mais de 5 anos tem desconto de 50%
        if (isLongTermClient()) {
            var valorComDesconto = valorTarifa.multiply(new BigDecimal("0.5"));
            return List.of(new TarifaCharged(contaId, tarifaId, valorComDesconto, 
                          operacao, "Desconto cliente fidelidade", Instant.now(), userId));
        }
        
        // Cobrança normal
        return List.of(new TarifaCharged(contaId, tarifaId, valorTarifa, operacao, 
                      null, Instant.now(), userId));
    }
    
    private boolean isPremiumAccount() {
        return tipoConta == TipoConta.PREMIUM || 
               saldo.compareTo(new BigDecimal("50000.00")) >= 0;
    }
    
    private boolean hasFreeTedAvailable() {
        return tipoConta == TipoConta.CORRENTE && tedGratuitosUsados < 2;
    }
    
    private boolean isLongTermClient() {
        return ChronoUnit.YEARS.between(dataAbertura, LocalDate.now()) >= 5;
    }
}
```

### Múltiplas projeções em ação

```java
// 1. Extrato do Cliente (tempo real)
@Component
public class ExtratoProjection {
    
    @EventHandler
    public void on(TarifaCharged event) {
        jdbcTemplate.update("""
            INSERT INTO extrato_conta (conta_id, data, tipo, valor, descricao, saldo_apos)
            VALUES (?, ?, 'DEBITO_TARIFA', ?, ?, 
                    (SELECT saldo_atual FROM contas WHERE id = ?))
        """, event.contaId(), event.occurredAt(), event.valorCobrado(), 
             buildDescricao(event), event.contaId());
    }
    
    @EventHandler
    public void on(TarifaWaived event) {
        jdbcTemplate.update("""
            INSERT INTO extrato_conta (conta_id, data, tipo, valor, descricao, saldo_apos)
            VALUES (?, ?, 'TARIFA_ISENTA', 0, ?, 
                    (SELECT saldo_atual FROM contas WHERE id = ?))
        """, event.contaId(), event.occurredAt(), 
             "Tarifa isenta: " + event.motivoIsencao(), event.contaId());
    }
}

// 2. Métricas para Business Intelligence
@Component
public class TarifaMetricsProjection {
    
    @EventHandler
    public void on(TarifaCharged event) {
        // Métricas em tempo real
        meterRegistry.counter("tarifas.cobradas", 
                             "tipo", event.operacao().name()).increment();
        meterRegistry.summary("tarifas.valor", 
                             "tipo", event.operacao().name()).record(event.valorCobrado().doubleValue());
        
        // Atualiza dashboard executivo (Redis)
        redisTemplate.opsForHash().increment("dashboard:tarifas:hoje", 
                                           "total_arrecadado", 
                                           event.valorCobrado().doubleValue());
    }
    
    @EventHandler
    public void on(TarifaWaived event) {
        meterRegistry.counter("tarifas.isentas", 
                             "motivo", categorizeWaiverReason(event.motivoIsencao())).increment();
        
        // Tracking de benefícios concedidos
        redisTemplate.opsForHash().increment("dashboard:tarifas:hoje", 
                                           "valor_isento", 
                                           event.valorIsento().doubleValue());
    }
}

// 3. Compliance e Auditoria (BACEN)
@Component
public class ComplianceProjection {
    
    @EventHandler
    public void on(TarifaCharged event) {
        // Relatório regulatório
        complianceRepository.save(RegistroTarifa.builder()
            .contaId(event.contaId())
            .tarifaId(event.tarifaId())
            .valorCobrado(event.valorCobrado())
            .tipoOperacao(event.operacao())
            .dataCobranca(event.occurredAt())
            .usuarioResponsavel(event.userId())
            .build());
        
        // Alertas de compliance
        if (event.valorCobrado().compareTo(new BigDecimal("100.00")) > 0) {
            alertService.sendToCompliance("Tarifa alta cobrada", event);
        }
    }
    
    @EventHandler
    public void on(TarifaWaived event) {
        // Log de isenções para auditoria
        isencaoAuditoriaRepository.save(new RegistroIsencao(
            event.contaId(), event.tarifaId(), event.valorIsento(), 
            event.motivoIsencao(), event.occurredAt(), event.userId()
        ));
    }
}
```

### Benefícios demonstrados no caso bancário

| Aspecto | Como CQRS + ES Resolve | Exemplo Prático |
|---------|------------------------|-----------------|
| **Auditoria Completa** | Todo evento é imutável e rastreável | "Por que cobraram R$ 12,50?" → Evento TarifaCalculada mostra regra aplicada |
| **Replay de Regras** | Pode reprocessar se regra mudar | Se BACEN alterar limite, reprocessa todas as cobranças do período |
| **Views Especializadas** | Mesmos eventos, diferentes projeções | Extrato cliente + Relatório BACEN + Dashboard BI + API Open Banking |
| **Performance** | Leitura otimizada independente | Extrato em Postgres, métricas em Redis, busca em Elasticsearch |
| **Debugging** | Timeline completa de eventos | Investigar transferência falhada vendo todos os eventos em ordem |
| **Compliance** | Histórico imutável para reguladores | BACEN pode auditar qualquer cobrança com trilha completa |

### Observabilidade em produção

```java
// Métricas essenciais para monitorar
@Component
public class TarifaObservability {
    
    @EventHandler
    public void on(TarifaCharged event) {
        // SLA: Tempo entre comando e cobrança
        var latency = Duration.between(event.comandoTimestamp(), event.occurredAt());
        meterRegistry.timer("tarifa.cobranca.latency").record(latency);
        
        // Rate de sucesso por tipo de operação
        meterRegistry.counter("tarifa.cobranca.success", 
                             "tipo", event.operacao().name()).increment();
    }
    
    @EventHandler  
    public void on(TarifaFailed event) {
        meterRegistry.counter("tarifa.cobranca.failed", 
                             "erro", event.tipoErro()).increment();
        
        // Alerta se taxa de erro > 5%
        if (getFailureRate() > 0.05) {
            alertService.sendToCritical("Taxa de erro alta em cobranças de tarifa");
        }
    }
}
```

## Padrões essenciais

### Idempotência e Ordenação

**Idempotência**: Consumidores devem processar o mesmo evento múltiplas vezes sem efeitos colaterais.

```java
// Tabela para tracking de eventos processados
CREATE TABLE applied_events (
    event_id text PRIMARY KEY,
    projection_name text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
);

@Component
public class ExtratoProjection {
    
    @EventHandler
    public void on(TarifaCharged event) {
        // Verifica se já foi processado
        if (wasAlreadyApplied(event.eventId(), "extrato")) {
            return; // Idempotência
        }
        
        // Processa o evento
        jdbcTemplate.update("""
            INSERT INTO extrato_conta (conta_id, data, tipo, valor, descricao)
            VALUES (?, ?, 'DEBITO_TARIFA', ?, ?)
        """, event.contaId(), event.occurredAt(), event.valorCobrado(), 
             buildDescricao(event));
        
        // Marca como processado
        markAsApplied(event.eventId(), "extrato");
    }
}
```

**Ordenação**: Use particionamento por `aggregateId` no message broker (Kafka) para manter ordem dentro do stream do agregado.

```yaml
# Kafka topic configuration
spring:
  kafka:
    producer:
      properties:
        partitioner.class: org.apache.kafka.clients.producer.internals.DefaultPartitioner
        # Eventos do mesmo agregado vão para a mesma partição
```

### Outros Padrões Críticos

- **Versionamento otimista**: `expectedVersion = history.size()` no append evita condições de corrida entre comandos.
- **Rebuild**: Para refazer um read model, limpe projeções e replay dos eventos a partir do event store.
- **Eventos como contratos**: Eventos são públicos dentro do domínio; quebre-os com cuidado (evolução/compatibilidade).
- **Dead-letter**: Guarde eventos que falharam na projeção e permita retries com backoff exponencial.

## Quando usar CQRS + ES

- Necessidade de **auditoria completa** e timeline de mudanças.
- **Muitos read models diferentes** para o mesmo domínio (relatórios, APIs, busca, cache).
- **Alto volume de escrita** com processamento assíncrono.

## Quando evitar

- Domínios simples, CRUD direto, requisitos de auditoria mínimos.
- Equipe/operacional ainda sem maturidade para lidar com eventual consistency e ops de replay.

## Trade-offs (resumo)

| Aspecto | Benefício | Custo/Complexidade |
|---------|-----------|-------------------|
| **Auditoria/Histórico** | Linha do tempo completa (eventos imutáveis) | Crescimento do store + governança |
| **Escalabilidade de leitura** | Read models sob medida, baratos de escalar | Atualização assíncrona/eventual consistency |
| **Evolução de esquema** | Projeções independentes | Versão/compat de eventos |
| **Depuração** | Replay, time-travel | Operação e tooling exigentes |

## Testes: foco no comportamento

**Given** (histórico de eventos) → **When** (comando) → **Then** (novos eventos esperados).

Testes de projeção: evento de entrada → estado/materialização esperado.

Exemplo minimalista de teste de comando:

```java
@Test
void shouldEmitContaAberta() {
    var conta = new ContaBancaria();
    var events = conta.abrirConta("conta-1", "cliente-1", TipoConta.CORRENTE, "admin");
    assertEquals(1, events.size());
    assertTrue(events.get(0) instanceof ContaAberta e && e.aggregateId().equals("conta-1"));
}

@Test  
void shouldRejectTransferenciaWithSaldoInsuficiente() {
    var conta = new ContaBancaria();
    conta.apply(new ContaAberta("conta-1", "cliente-1", TipoConta.CORRENTE, Instant.now(), "admin"));
    
    assertThrows(IllegalStateException.class, () -> 
        conta.realizarTransferencia("conta-2", new BigDecimal("1000.00"), TipoTransferencia.TED, "admin"));
}
```

## Estratégia de migração (green/brown field)

1. **Comece pequeno**: uma fronteira de domínio, apenas a escrita com ES e uma projeção simples.
2. **Duplique escrita** por um tempo (feature toggle) para ganhar confiança.
3. **Corte o legado** quando a leitura for atendida pelas projeções e a auditoria estiver validada.
4. **Automatize replay** e monitore lag das projeções (Datadog/Prometheus).

## Conclusão

CQRS + Event Sourcing oferecem potência para domínios complexos: **rastreabilidade**, **reprocessamento** e **leitura sob medida**.

O custo vem em operação, consistência eventual e disciplina de eventos.

Para domínios com auditoria rígida e vários read models, a combinação é recomendada — mas só funciona bem se idempotência, optimistic locking, replay e observabilidade fizerem parte do desenho desde o início.

## Próximos passos

No próximo artigo, vou entrar em padrões de consistência (sagas, outbox, exactly-once-like) e observabilidade para pipelines de eventos (tracing, métricas e dead-letters).
