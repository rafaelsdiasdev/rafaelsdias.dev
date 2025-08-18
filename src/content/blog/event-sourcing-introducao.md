---
title: 'Event Sourcing: Introdução e Casos de Uso'
description: 'Entenda como Event Sourcing pode resolver problemas complexos de auditoria, histórico e consistência em sistemas distribuídos.'
pubDate: '2024-12-25'
---

**Event Sourcing** é um padrão arquitetural onde o estado de uma aplicação é determinado por uma sequência de eventos imutáveis, ao invés de armazenar apenas o estado atual.

## Conceito Fundamental

Em vez de persistir o estado atual de uma entidade, persistimos todos os eventos que levaram a esse estado. O estado atual é reconstruído aplicando todos os eventos em ordem cronológica.

### Exemplo Tradicional vs Event Sourcing

**Abordagem Tradicional:**
```sql
-- Tabela conta_bancaria
id: 123
saldo: 1500.00
ultima_atualizacao: 2024-12-30
```

**Event Sourcing:**
```json
// Stream de eventos para conta 123
[
  {"tipo": "ContaCriada", "valor": 0, "timestamp": "2024-01-01"},
  {"tipo": "DepositoRealizado", "valor": 1000, "timestamp": "2024-01-02"},
  {"tipo": "SaqueRealizado", "valor": 200, "timestamp": "2024-01-15"},
  {"tipo": "DepositoRealizado", "valor": 700, "timestamp": "2024-02-01"}
]
// Saldo atual = 0 + 1000 - 200 + 700 = 1500
```

## Vantagens do Event Sourcing

### 1. Auditoria Completa
- **Histórico completo** de todas as mudanças
- **Rastreabilidade** de quem fez o que e quando
- **Compliance** para regulamentações financeiras

### 2. Debugging e Análise
```java
// Reproduzir estado em qualquer ponto no tempo
AccountAggregate account = replayEventsUntil(accountId, specificDate);
```

### 3. Flexibilidade de Projeções
```java
// Diferentes visões dos mesmos dados
public class AccountBalanceProjection {
    // Visão simples do saldo atual
}

public class AccountStatementProjection {
    // Visão detalhada para extratos
}

public class AccountAnalyticsProjection {
    // Visão para análise de comportamento
}
```

### 4. Temporal Queries
- Consultar estado em qualquer momento passado
- Análise de tendências históricas
- Comparações temporais

## Implementação Básica

### Estrutura de Eventos

```java
public abstract class DomainEvent {
    private final String aggregateId;
    private final long version;
    private final Instant timestamp;
    private final String eventType;
    
    // getters e constructors
}

public class AccountCreated extends DomainEvent {
    private final String accountNumber;
    private final String ownerId;
}

public class MoneyDeposited extends DomainEvent {
    private final BigDecimal amount;
    private final String description;
}
```

### Event Store

```java
public interface EventStore {
    void saveEvents(String aggregateId, List<DomainEvent> events, long expectedVersion);
    List<DomainEvent> getEventsForAggregate(String aggregateId);
    List<DomainEvent> getEventsForAggregate(String aggregateId, long fromVersion);
}
```

### Aggregate Reconstruction

```java
public class AccountAggregate {
    private String id;
    private BigDecimal balance;
    private List<DomainEvent> uncommittedEvents = new ArrayList<>();
    
    public static AccountAggregate fromEvents(List<DomainEvent> events) {
        AccountAggregate account = new AccountAggregate();
        events.forEach(account::apply);
        return account;
    }
    
    private void apply(DomainEvent event) {
        switch (event.getEventType()) {
            case "AccountCreated":
                applyAccountCreated((AccountCreated) event);
                break;
            case "MoneyDeposited":
                applyMoneyDeposited((MoneyDeposited) event);
                break;
            // outros eventos...
        }
    }
}
```

## Padrões Relacionados

### 1. CQRS (Command Query Responsibility Segregation)
Event Sourcing combina naturalmente com CQRS:

```java
// Command Side
public class DepositMoneyCommandHandler {
    public void handle(DepositMoneyCommand command) {
        AccountAggregate account = eventStore.loadAggregate(command.getAccountId());
        account.deposit(command.getAmount());
        eventStore.saveEvents(account.getId(), account.getUncommittedEvents());
    }
}

// Query Side
public class AccountBalanceQueryHandler {
    public AccountBalance handle(GetAccountBalanceQuery query) {
        return accountBalanceProjection.getBalance(query.getAccountId());
    }
}
```

### 2. Snapshots
Para aggregates com muitos eventos:

```java
public class SnapshotStore {
    public void saveSnapshot(String aggregateId, Object snapshot, long version);
    public Optional<Snapshot> getSnapshot(String aggregateId);
}

// Reconstruction otimizada
public AccountAggregate loadAggregate(String aggregateId) {
    Optional<Snapshot> snapshot = snapshotStore.getSnapshot(aggregateId);
    List<DomainEvent> events;
    
    if (snapshot.isPresent()) {
        events = eventStore.getEventsForAggregate(aggregateId, snapshot.get().getVersion());
        AccountAggregate account = AccountAggregate.fromSnapshot(snapshot.get());
        events.forEach(account::apply);
        return account;
    } else {
        events = eventStore.getEventsForAggregate(aggregateId);
        return AccountAggregate.fromEvents(events);
    }
}
```

## Desafios e Considerações

### 1. Complexidade
- **Curva de aprendizado** mais íngreme
- **Infraestrutura** mais complexa
- **Debugging** pode ser mais difícil

### 2. Performance
```java
// Projection updating pode ser assíncrona
@EventHandler
public class AccountBalanceProjectionHandler {
    @Async
    public void on(MoneyDeposited event) {
        // Atualiza projection de forma assíncrona
        accountBalanceProjection.updateBalance(
            event.getAggregateId(), 
            event.getAmount()
        );
    }
}
```

### 3. Versionamento de Eventos
```java
// Upcasting para compatibilidade
public class MoneyDepositedV2 extends MoneyDeposited {
    private final String currency; // novo campo
    
    public static MoneyDepositedV2 fromV1(MoneyDepositedV1 oldEvent) {
        return new MoneyDepositedV2(
            oldEvent.getAmount(),
            oldEvent.getDescription(),
            "BRL" // valor padrão para currency
        );
    }
}
```

### 4. Eventual Consistency
- Projections podem estar temporariamente desatualizadas
- Necessário considerar nos requisitos de negócio

## Casos de Uso Ideais

### 1. Sistemas Financeiros
- Auditoria obrigatória
- Histórico de transações
- Reconciliação

### 2. E-commerce
- Histórico de pedidos
- Análise de comportamento
- Inventory tracking

### 3. Sistemas de Workflow
- Rastreamento de aprovações
- Histórico de mudanças de status
- Compliance

## Ferramentas e Tecnologias

### Event Stores
- **EventStore DB**: Banco especializado
- **Apache Kafka**: Para streaming
- **PostgreSQL**: Usando JSON/JSONB
- **MongoDB**: Para flexibilidade de schema

### Frameworks
- **Axon Framework** (Java)
- **NEventStore** (.NET)
- **Eventide** (Ruby)

## Conclusão

Event Sourcing é um padrão poderoso que oferece:

- **Auditoria completa** e transparência
- **Flexibilidade** para novas funcionalidades
- **Análise temporal** rica
- **Debugging** detalhado

Porém, adiciona complexidade significativa. Use quando os benefícios justificarem o investimento em infraestrutura e conhecimento da equipe.

A decisão deve considerar os requisitos específicos de auditoria, análise histórica e a capacidade da equipe para implementar e manter a solução adequadamente. 