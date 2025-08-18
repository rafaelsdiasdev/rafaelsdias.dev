---
title: 'Circuit Breaker Pattern: Resiliência em Microsserviços'
description: 'Como implementar tolerância a falhas em sistemas distribuídos usando o padrão Circuit Breaker para evitar cascata de falhas.'
pubDate: '2024-12-28'
---

O **Circuit Breaker Pattern** é um padrão essencial para garantir resiliência em arquiteturas de microsserviços, protegendo o sistema contra falhas em cascata e permitindo recuperação automática.

## O Problema das Falhas em Cascata

Em sistemas distribuídos, quando um serviço falha, pode causar um efeito dominó que derruba outros serviços dependentes. Isso acontece porque:

- Timeouts e retries consomem recursos
- Conexões ficam abertas aguardando resposta
- Thread pools se esgotam
- Memory leaks podem ocorrer

## Como Funciona o Circuit Breaker

O padrão funciona como um disjuntor elétrico, com três estados principais:

### 1. Closed (Fechado)
- Estado normal de operação
- Requisições passam normalmente
- Monitora falhas e latência

### 2. Open (Aberto)
- Circuito "quebrado" por excesso de falhas
- Requisições são rejeitadas imediatamente
- Não há tentativas de comunicação

### 3. Half-Open (Meio Aberto)
- Estado de teste após período de espera
- Permite algumas requisições de teste
- Decide se volta para Closed ou Open

## Implementação Prática

### Configuração Básica

```java
CircuitBreaker circuitBreaker = CircuitBreaker.ofDefaults("paymentService");
circuitBreaker.getEventPublisher()
    .onStateTransition(event -> 
        log.info("Circuit breaker state transition: {}", event));
```

### Parâmetros Importantes

**Failure Rate Threshold**: Percentual de falhas para abrir o circuito
- Valor típico: 50-60%

**Wait Duration**: Tempo em estado Open antes de tentar Half-Open
- Valor típico: 30-60 segundos

**Slow Call Threshold**: Tempo máximo para considerar uma chamada lenta
- Depende do SLA do serviço

**Minimum Number of Calls**: Número mínimo de chamadas para calcular taxa de erro
- Valor típico: 10-20 chamadas

## Estratégias de Fallback

Quando o circuito está aberto, você precisa de uma estratégia alternativa:

### Cache de Dados
```java
public User getUserById(String id) {
    return circuitBreaker.executeSupplier(() -> {
        return userService.findById(id);
    }).recover(throwable -> {
        return userCache.get(id); // Fallback para cache
    });
}
```

### Resposta Padrão
```java
public List<Product> getRecommendations(String userId) {
    return circuitBreaker.executeSupplier(() -> {
        return recommendationService.getFor(userId);
    }).recover(throwable -> {
        return getDefaultRecommendations(); // Lista padrão
    });
}
```

### Degradação Funcional
```java
public PaymentResult processPayment(PaymentRequest request) {
    return circuitBreaker.executeSupplier(() -> {
        return externalPaymentGateway.process(request);
    }).recover(throwable -> {
        return queueForLaterProcessing(request); // Processa depois
    });
}
```

## Monitoramento e Métricas

### Métricas Essenciais
- **Taxa de falhas** por serviço
- **Latência média** das chamadas
- **Estado atual** do circuit breaker
- **Número de chamadas** rejeitadas

### Alertas Importantes
- Circuit breaker aberto por muito tempo
- Taxa de falhas acima do normal
- Latência crescente antes das falhas

## Configuração Avançada

### Por Tipo de Exceção
```java
CircuitBreaker circuitBreaker = CircuitBreaker.custom("serviceA")
    .failureRateThreshold(50)
    .waitDurationInOpenState(Duration.ofSeconds(30))
    .recordExceptions(IOException.class, TimeoutException.class)
    .ignoreExceptions(BusinessException.class)
    .build();
```

### Configuração Dinâmica
Permite ajustar parâmetros em runtime baseado em:
- Horário do dia (mais tolerante durante picos)
- Load do sistema
- Importância do serviço

## Boas Práticas

### 1. Granularidade Adequada
- Um circuit breaker por dependência externa
- Não compartilhar entre operações muito diferentes
- Considerar circuit breakers por tenant em sistemas multi-tenant

### 2. Timeouts Adequados
- Circuit breaker timeout < HTTP timeout
- HTTP timeout < Load balancer timeout
- Configurar timeouts em toda a stack

### 3. Testes de Caos
- Simular falhas em produção
- Validar comportamento dos fallbacks
- Testar recuperação automática

### 4. Logging e Observabilidade
```java
circuitBreaker.getEventPublisher()
    .onCallNotPermitted(event -> 
        log.warn("Call rejected by circuit breaker: {}", event))
    .onFailureRateExceeded(event -> 
        log.error("Failure rate exceeded: {}", event));
```

## Integração com Service Mesh

Em ambientes com Istio/Envoy, o circuit breaker pode ser configurado declarativamente:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: payment-service
spec:
  host: payment-service
  trafficPolicy:
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
```

## Conclusão

O Circuit Breaker Pattern é fundamental para construir sistemas resilientes. Ele oferece:

- **Proteção** contra falhas em cascata
- **Recuperação automática** de serviços
- **Melhor experiência** do usuário com fallbacks
- **Visibilidade** sobre a saúde dos serviços

A implementação adequada deste padrão, combinada com monitoramento efetivo, é essencial para a operação confiável de arquiteturas distribuídas em produção. 