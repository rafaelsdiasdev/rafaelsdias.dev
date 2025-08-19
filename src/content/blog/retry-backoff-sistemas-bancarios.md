---
title: 'Retry com Backoff: Resiliência em Sistemas Distribuídos'
description: 'Como implementar estratégias inteligentes de retry para garantir robustez em operações distribuídas críticas'
pubDate: 'Jan 16 2025'
---

# Retry com Backoff: Resiliência em Sistemas Distribuídos

## Para quem está começando: explicação simples

### O Problema: Quando Sistemas "Ficam Ocupados"

Imagine que você está fazendo um PIX de R$ 500:

**Situação 1 - Sistema Sobrecarregado:**
- Você aperta "confirmar PIX"
- Sistema precisa validar dados, calcular valores, processar transação
- Tela fica carregando... carregando...
- "Erro temporário, tente novamente"
- Sistema tenta de novo IMEDIATAMENTE
- Erro de novo... e de novo... e de novo...

**Problema**: Sistema está "bombardeando" serviços que já estão sobrecarregados!

### A Solução: Retry Inteligente

**Sistema Moderno com Retry Inteligente:**
- ⏱️ **1ª tentativa**: Processa PIX → Falha imediata
- ⏱️ **2ª tentativa**: Espera 1 segundo → Tenta novamente
- ⏱️ **3ª tentativa**: Espera 2 segundos → Nova tentativa
- ⏱️ **4ª tentativa**: Espera 4 segundos → Mais uma tentativa
- ⏱️ **5ª tentativa**: Espera 8 segundos → Última tentativa

**Resultado**: Sistemas têm tempo para "respirar" e a operação tem mais chance de dar certo!

### Analogia do Call Center

É como ligar para o atendimento do banco:

🔴 **Jeito Errado (sem backoff):**
- 14:00:00 - Liga: "Todas as linhas ocupadas"
- 14:00:01 - Liga: "Todas as linhas ocupadas"  
- 14:00:02 - Liga: "Todas as linhas ocupadas"
- Resultado: Você entope ainda mais as linhas!

🟢 **Jeito Certo (com backoff):**
- 14:00:00 - Liga: "Todas as linhas ocupadas"
- 14:01:00 - Liga: "Todas as linhas ocupadas"
- 14:03:00 - Liga: "Todas as linhas ocupadas"
- 14:07:00 - Liga: ✅ **"Olá, como posso ajudar?"**

### Tipos de "Espera Inteligente"

**Linear (sempre o mesmo tempo):**
- Espera 2s, 2s, 2s, 2s...
- Como bater na porta de 2 em 2 segundos

**Exponencial (dobra o tempo):**
- Espera 1s, 2s, 4s, 8s, 16s...
- Como dar mais e mais espaço para o sistema se recuperar

**Com Jitter (aleatório):**
- Espera 1s, 3s, 7s, 12s...
- Como evitar que todo mundo tente ao mesmo tempo

### Por que isso é crucial no banco?

- **🏦 PIX**: Milhões de transações simultâneas
- **💳 Cartão**: Validação em milissegundos com lojas
- **📊 Consultas**: CPF no SERASA, SPC, BACEN
- **🔄 Integrações**: Outros bancos, fintechs, marketplaces

**Sem retry inteligente**: Sistemas colapsam em horários de pico
**Com retry inteligente**: Operações funcionam mesmo sob pressão

## Conceitos técnicos

### O Desafio das Falhas Transitórias

Em sistemas bancários, nem toda falha é permanente. Muitas são transitórias:

- **Sobrecarga temporária**: Pico de transações PIX no Black Friday
- **Latência de rede**: Consulta ao BACEN com delay momentâneo  
- **Rate limiting**: APIs externas limitando requisições por segundo
- **Recursos esgotados**: Pool de conexões temporariamente cheio

### Estratégias de Backoff

**Exponential Backoff**: Tempo de espera cresce exponencialmente (2^retry * base_delay)
**Linear Backoff**: Incremento fixo no tempo de espera
**Jitter**: Adiciona aleatoriedade para evitar "thundering herd"
**Circuit Breaker**: Para tentativas quando falhas são consecutivas

## Implementação: Estratégias de Retry

### 1. Exponential Backoff Básico

```java
@Component
public class ExponentialBackoffRetry {
    
    private static final int MAX_RETRIES = 5;
    private static final long BASE_DELAY_MS = 1000; // 1 segundo
    private static final long MAX_DELAY_MS = 30000; // 30 segundos
    
    public <T> T executeWithRetry(Supplier<T> operation, String operationName) {
        Exception lastException = null;
        
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                T result = operation.get();
                
                if (attempt > 0) {
                    log.info("Operação {} sucedeu na tentativa {}", operationName, attempt + 1);
                }
                
                return result;
                
            } catch (Exception e) {
                lastException = e;
                
                if (attempt == MAX_RETRIES) {
                    log.error("Operação {} falhou após {} tentativas", operationName, MAX_RETRIES + 1);
                    break;
                }
                
                long delay = calculateExponentialDelay(attempt);
                log.warn("Operação {} falhou na tentativa {}. Tentando novamente em {}ms. Erro: {}", 
                    operationName, attempt + 1, delay, e.getMessage());
                
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Retry interrompido", ie);
                }
            }
        }
        
        throw new MaxRetriesExceededException("Máximo de tentativas excedido para " + operationName, lastException);
    }
    
    private long calculateExponentialDelay(int attempt) {
        long delay = (long) (BASE_DELAY_MS * Math.pow(2, attempt));
        return Math.min(delay, MAX_DELAY_MS);
    }
}
```

### 2. Retry com Jitter (Anti-Thundering Herd)

```java
@Component
public class JitterBackoffRetry {
    
    private final Random random = new Random();
    
    public <T> T executeWithJitter(Supplier<T> operation, String operationName) {
        Exception lastException = null;
        
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                return operation.get();
                
            } catch (Exception e) {
                lastException = e;
                
                if (attempt == MAX_RETRIES) break;
                
                long delay = calculateJitterDelay(attempt);
                sleepWithInterruptCheck(delay);
            }
        }
        
        throw new MaxRetriesExceededException("Falhou após " + (MAX_RETRIES + 1) + " tentativas", lastException);
    }
    
    private long calculateJitterDelay(int attempt) {
        // Exponential + Full Jitter
        long exponentialDelay = (long) (BASE_DELAY_MS * Math.pow(2, attempt));
        long cappedDelay = Math.min(exponentialDelay, MAX_DELAY_MS);
        
        // Jitter: 0 a cappedDelay
        return random.nextLong(cappedDelay + 1);
    }
    
    private void sleepWithInterruptCheck(long delayMs) {
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Retry interrompido", e);
        }
    }
}
```

### 3. Retry Condicional (Smart Retry)

```java
@Component
public class SmartRetry {
    
    private final MeterRegistry meterRegistry;
    
    public <T> T executeSmartRetry(Supplier<T> operation, String operationName, RetryConfig config) {
        Timer.Sample sample = Timer.start(meterRegistry);
        Exception lastException = null;
        
        for (int attempt = 0; attempt <= config.getMaxRetries(); attempt++) {
            try {
                T result = operation.get();
                
                // Métricas de sucesso
                sample.stop(Timer.builder("retry.operation.duration")
                    .tag("operation", operationName)
                    .tag("result", "success")
                    .tag("attempt", String.valueOf(attempt + 1))
                    .register(meterRegistry));
                
                meterRegistry.counter("retry.attempts.total",
                    "operation", operationName,
                    "result", "success").increment();
                
                return result;
                
            } catch (Exception e) {
                lastException = e;
                
                // Verifica se deve fazer retry
                if (!shouldRetry(e, attempt, config)) {
                    break;
                }
                
                long delay = config.getBackoffStrategy().calculateDelay(attempt);
                
                log.warn("Tentativa {} falhou para {}: {}. Próxima tentativa em {}ms", 
                    attempt + 1, operationName, e.getMessage(), delay);
                
                sleepWithInterruptCheck(delay);
                
                meterRegistry.counter("retry.attempts.total",
                    "operation", operationName,
                    "result", "retry").increment();
            }
        }
        
        // Métricas de falha
        sample.stop(Timer.builder("retry.operation.duration")
            .tag("operation", operationName)
            .tag("result", "failed")
            .register(meterRegistry));
        
        meterRegistry.counter("retry.attempts.total",
            "operation", operationName,
            "result", "failed").increment();
        
        throw new MaxRetriesExceededException("Operação " + operationName + " falhou definitivamente", lastException);
    }
    
    private boolean shouldRetry(Exception e, int attempt, RetryConfig config) {
        // Não retry se atingiu máximo
        if (attempt >= config.getMaxRetries()) {
            return false;
        }
        
        // Não retry para erros não-retryable
        if (e instanceof IllegalArgumentException || 
            e instanceof SecurityException ||
            e instanceof AuthenticationException) {
            log.warn("Erro não-retryable: {}. Não tentando novamente.", e.getClass().getSimpleName());
            return false;
        }
        
        // Retry para erros transitórios
        if (e instanceof SocketTimeoutException ||
            e instanceof ConnectException ||
            e instanceof HttpRetryableException ||
            e instanceof TemporaryResourceException) {
            return true;
        }
        
        // Verificar por HTTP status codes
        if (e instanceof HttpClientException httpEx) {
            int statusCode = httpEx.getStatusCode();
            
            // Retry para 5xx (server errors) mas não para 4xx (client errors)
            return statusCode >= 500 && statusCode < 600;
        }
        
        return config.isRetryByDefault();
    }
}

// Configuração flexível
public class RetryConfig {
    private final int maxRetries;
    private final BackoffStrategy backoffStrategy;
    private final boolean retryByDefault;
    private final Set<Class<? extends Exception>> retryableExceptions;
    private final Set<Class<? extends Exception>> nonRetryableExceptions;
    
    // builder pattern, getters...
}

// Estratégias plugáveis
public interface BackoffStrategy {
    long calculateDelay(int attempt);
}

public class ExponentialBackoffStrategy implements BackoffStrategy {
    private final long baseDelayMs;
    private final long maxDelayMs;
    private final double multiplier;
    private final boolean jitter;
    private final Random random = new Random();
    
    @Override
    public long calculateDelay(int attempt) {
        long delay = (long) (baseDelayMs * Math.pow(multiplier, attempt));
        delay = Math.min(delay, maxDelayMs);
        
        if (jitter) {
            // Full jitter: 0 to calculated delay
            delay = random.nextLong(delay + 1);
        }
        
        return delay;
    }
}
```

## Exemplos Bancários Práticos

### 1. PIX: Consulta BACEN com Retry

```java
@Service
public class PixService {
    
    private final BacenApiClient bacenClient;
    private final SmartRetry retryService;
    
    public PixValidationResult validarChavePix(String chave) {
        RetryConfig config = RetryConfig.builder()
            .maxRetries(3)
            .backoffStrategy(new ExponentialBackoffStrategy(500, 5000, 2.0, true))
            .retryableExceptions(Set.of(
                SocketTimeoutException.class,
                BacenTemporaryUnavailableException.class,
                BacenRateLimitException.class
            ))
            .nonRetryableExceptions(Set.of(
                PixChaveInvalidaException.class,
                PixChaveNaoEncontradaException.class
            ))
            .build();
        
        return retryService.executeSmartRetry(
            () -> {
                log.debug("Consultando chave PIX no BACEN: {}", maskChave(chave));
                
                var response = bacenClient.consultarChave(chave);
                
                if (response.getStatus() == BacenStatus.RATE_LIMITED) {
                    throw new BacenRateLimitException("Rate limit atingido");
                }
                
                if (response.getStatus() == BacenStatus.TEMPORARY_ERROR) {
                    throw new BacenTemporaryUnavailableException("BACEN temporariamente indisponível");
                }
                
                return new PixValidationResult(response.getChave(), response.getTitular());
            },
            "consulta-pix-bacen"
        );
    }
    
    private String maskChave(String chave) {
        if (chave.length() > 6) {
            return chave.substring(0, 3) + "***" + chave.substring(chave.length() - 3);
        }
        return "***";
    }
}
```

### 2. TED: Integração com Outros Bancos

```java
@Service
public class TedService {
    
    private final InterbankApiClient interbankClient;
    private final RetryService retryService;
    
    public TedConfirmation processarTed(TedRequest request) {
        
        // Configuração específica para TED
        RetryConfig tedConfig = RetryConfig.builder()
            .maxRetries(5) // TED é crítico, mais tentativas
            .backoffStrategy(new ExponentialBackoffStrategy(1000, 30000, 1.5, true))
            .retryByDefault(false) // Conservador: só retry explícito
            .retryableExceptions(Set.of(
                SocketTimeoutException.class,
                InterbankTimeoutException.class,
                InterbankBusyException.class,
                HttpStatus5xxException.class
            ))
            .nonRetryableExceptions(Set.of(
                ContaInexistenteException.class,
                SaldoInsuficienteException.class,
                TedLimitExceededException.class,
                InvalidAccountException.class
            ))
            .build();
        
        return retryService.executeSmartRetry(
            () -> {
                // Validações pré-envio (não-retryable)
                validateTedRequest(request);
                
                // Envio para banco de destino
                var response = interbankClient.processarTed(
                    request.getBancoDestino(),
                    request.getContaDestino(),
                    request.getValor(),
                    request.getFinalidadeTed()
                );
                
                // Mapeamento de respostas para exceptions apropriadas
                return mapToTedConfirmation(response);
                
            },
            "processar-ted"
        );
    }
    
    private void validateTedRequest(TedRequest request) {
        if (request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor deve ser positivo");
        }
        
        if (request.getValor().compareTo(new BigDecimal("1000000")) > 0) {
            throw new TedLimitExceededException("Valor excede limite diário");
        }
        
        // Outras validações que não devem ser retried...
    }
}
```

### 3. Consulta de Score: Integração SERASA/SPC

```java
@Service
public class ScoreService {
    
    @Async
    @Retryable(
        value = {SocketTimeoutException.class, ServiceUnavailableException.class},
        maxAttempts = 4,
        backoff = @Backoff(
            delay = 2000,      // 2 segundos inicial
            multiplier = 1.8,   // Crescimento moderado
            maxDelay = 20000,   // Máximo 20 segundos
            random = true       // Jitter automático
        )
    )
    public CompletableFuture<ScoreResult> consultarScore(String cpf) {
        
        log.debug("Consultando score para CPF: {}", maskCpf(cpf));
        
        try {
            // Consulta paralela em múltiplos bureaus
            CompletableFuture<ScoreData> serasaFuture = consultarSerasa(cpf);
            CompletableFuture<ScoreData> spcFuture = consultarSpc(cpf);
            
            // Combina resultados (pelo menos 1 deve dar certo)
            return CompletableFuture.allOf(serasaFuture, spcFuture)
                .thenApply(v -> {
                    var serasaData = serasaFuture.getNow(null);
                    var spcData = spcFuture.getNow(null);
                    
                    return combineScoreResults(serasaData, spcData);
                });
                
        } catch (Exception e) {
            log.error("Erro ao consultar score para CPF {}: {}", maskCpf(cpf), e.getMessage());
            throw new ScoreConsultationException("Falha na consulta de score", e);
        }
    }
    
    @Recover
    public CompletableFuture<ScoreResult> recoverScoreConsultation(Exception ex, String cpf) {
        log.error("Todas as tentativas de consulta de score falharam para CPF {}: {}", 
            maskCpf(cpf), ex.getMessage());
            
        // Retorna score padrão/conservador
        var defaultScore = ScoreResult.builder()
            .cpf(cpf)
            .score(500) // Score neutro
            .fonte("DEFAULT")
            .dataConsulta(Instant.now())
            .observacao("Consulta falhou, usando score padrão")
            .build();
            
        return CompletableFuture.completedFuture(defaultScore);
    }
    
    private CompletableFuture<ScoreData> consultarSerasa(String cpf) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return serasaApiClient.getScore(cpf);
            } catch (Exception e) {
                log.warn("Falha na consulta SERASA para CPF {}: {}", maskCpf(cpf), e.getMessage());
                return null;
            }
        });
    }
}
```

## Circuit Breaker + Retry: Proteção Dupla

```java
@Component
public class ResilientBankingService {
    
    private final CircuitBreaker circuitBreaker;
    private final RetryService retryService;
    private final MeterRegistry meterRegistry;
    
    public ResilientBankingService() {
        this.circuitBreaker = CircuitBreaker.ofDefaults("banking-service");
        
        // Configuração do Circuit Breaker
        circuitBreaker.getEventPublisher()
            .onStateTransition(event -> 
                log.info("Circuit breaker mudou de {} para {}", 
                    event.getStateTransition().getFromState(),
                    event.getStateTransition().getToState()))
            .onCallNotPermitted(event -> 
                meterRegistry.counter("circuit.breaker.rejected",
                    "service", "banking").increment())
            .onError(event ->
                meterRegistry.counter("circuit.breaker.error",
                    "service", "banking",
                    "error", event.getThrowable().getClass().getSimpleName()).increment());
    }
    
    public <T> T executeResilient(Supplier<T> operation, String operationName) {
        
        // Primeira camada: Circuit Breaker
        Supplier<T> decoratedSupplier = CircuitBreaker
            .decorateSupplier(circuitBreaker, operation);
        
        // Segunda camada: Retry (só se circuit breaker permitir)
        RetryConfig retryConfig = RetryConfig.builder()
            .maxRetries(3)
            .backoffStrategy(new ExponentialBackoffStrategy(1000, 10000, 2.0, true))
            .retryableExceptions(Set.of(
                SocketTimeoutException.class,
                ConnectException.class
            ))
            .nonRetryableExceptions(Set.of(
                CallNotPermittedException.class // Circuit breaker aberto
            ))
            .build();
        
        try {
            return retryService.executeSmartRetry(decoratedSupplier, operationName, retryConfig);
            
        } catch (CallNotPermittedException e) {
            log.warn("Circuit breaker aberto para operação: {}", operationName);
            
            // Fallback ou cache
            return handleCircuitBreakerOpen(operationName);
        }
    }
    
    @SuppressWarnings("unchecked")
    private <T> T handleCircuitBreakerOpen(String operationName) {
        // Estratégias de fallback por tipo de operação
        
        if (operationName.contains("consulta-score")) {
            return (T) getDefaultScore();
        }
        
        if (operationName.contains("validacao-antifraude")) {
            return (T) getConservativeAntiFraudResult();
        }
        
        if (operationName.contains("cotacao-moeda")) {
            return (T) getCachedExchangeRate();
        }
        
        throw new ServiceUnavailableException("Serviço " + operationName + " temporariamente indisponível");
    }
}
```

## Observabilidade: Métricas de Retry

### 1. Métricas Essenciais

```java
@Component
public class RetryMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public void recordRetryAttempt(String operation, int attempt, String result, long durationMs) {
        
        // Contador de tentativas por resultado
        meterRegistry.counter("retry.attempts",
            "operation", operation,
            "attempt", String.valueOf(attempt),
            "result", result).increment();
        
        // Histograma de duração por tentativa
        meterRegistry.timer("retry.attempt.duration",
            "operation", operation,
            "attempt", String.valueOf(attempt)).record(durationMs, TimeUnit.MILLISECONDS);
        
        // Gauge do número de operações atualmente em retry
        meterRegistry.gauge("retry.operations.active",
            Tags.of("operation", operation),
            getCurrentActiveRetries(operation));
    }
    
    public void recordFinalResult(String operation, boolean success, int totalAttempts, long totalDurationMs) {
        
        // Taxa de sucesso vs falha final
        meterRegistry.counter("retry.final.result",
            "operation", operation,
            "success", String.valueOf(success)).increment();
        
        // Distribuição de tentativas necessárias para sucesso
        if (success) {
            meterRegistry.counter("retry.success.attempts",
                "operation", operation,
                "attempts", String.valueOf(totalAttempts)).increment();
        }
        
        // Tempo total end-to-end
        meterRegistry.timer("retry.total.duration",
            "operation", operation,
            "result", success ? "success" : "failed").record(totalDurationMs, TimeUnit.MILLISECONDS);
    }
}
```

### 2. Dashboard Grafana

```sql
-- Queries recomendadas para dashboards

-- Taxa de sucesso por operação (últimas 5 min)
rate(retry_final_result_total{success="true"}[5m]) / 
rate(retry_final_result_total[5m]) * 100

-- Percentil 95 de duração total por operação
histogram_quantile(0.95, 
  rate(retry_total_duration_bucket[5m]))

-- Distribuição de tentativas necessárias para sucesso
sum by (attempts) (
  rate(retry_success_attempts_total[5m])
)

-- Operações que mais fazem retry
topk(10, 
  sum by (operation) (
    rate(retry_attempts_total{result="retry"}[5m])
  )
)

-- Circuit breaker status
circuit_breaker_state{state="OPEN"} > 0
```

### 3. Alertas Críticos

```yaml
# alerts.yml
groups:
  - name: retry-patterns
    rules:
      - alert: HighRetryRate
        expr: |
          sum(rate(retry_attempts_total{result="retry"}[5m])) by (operation) /
          sum(rate(retry_attempts_total[5m])) by (operation) > 0.3
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Taxa de retry alta para {{ $labels.operation }}"
          description: "Operação {{ $labels.operation }} tem {{ $value | humanizePercentage }} de taxa de retry"
      
      - alert: RetryFailureSpike
        expr: |
          sum(rate(retry_final_result_total{success="false"}[5m])) by (operation) > 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Spike de falhas após retry para {{ $labels.operation }}"
          description: "{{ $value }} falhas/segundo após esgotar retries"
      
      - alert: CircuitBreakerOpen
        expr: circuit_breaker_state{state="OPEN"} > 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Circuit breaker aberto para {{ $labels.service }}"
          description: "Serviço {{ $labels.service }} com circuit breaker aberto"
```

## Padrões de Produção Bancária

### 1. Configuração por Criticidade

```java
@Configuration
public class RetryConfiguration {
    
    @Bean
    @Qualifier("critical")
    public RetryConfig criticalOperationsRetry() {
        // Para operações críticas: PIX, TED, Débitos
        return RetryConfig.builder()
            .maxRetries(5)
            .backoffStrategy(new ExponentialBackoffStrategy(
                500,    // 500ms inicial
                15000,  // máximo 15s
                1.8,    // crescimento moderado
                true    // jitter
            ))
            .retryByDefault(false)
            .retryableExceptions(Set.of(
                SocketTimeoutException.class,
                ConnectException.class,
                TemporaryResourceException.class
            ))
            .build();
    }
    
    @Bean
    @Qualifier("standard")
    public RetryConfig standardOperationsRetry() {
        // Para operações padrão: Consultas, Validações
        return RetryConfig.builder()
            .maxRetries(3)
            .backoffStrategy(new ExponentialBackoffStrategy(
                1000,   // 1s inicial
                10000,  // máximo 10s
                2.0,    // crescimento padrão
                true
            ))
            .retryByDefault(false)
            .build();
    }
    
    @Bean
    @Qualifier("background")
    public RetryConfig backgroundOperationsRetry() {
        // Para operações background: Relatórios, Sincronizações
        return RetryConfig.builder()
            .maxRetries(10)  // Pode tentar mais vezes
            .backoffStrategy(new ExponentialBackoffStrategy(
                2000,   // 2s inicial
                60000,  // máximo 1 minuto
                2.0,
                true
            ))
            .retryByDefault(true)  // Mais permissivo
            .build();
    }
}
```

### 2. Integração com Health Checks

```java
@Component
public class RetryHealthIndicator implements HealthIndicator {
    
    private final MeterRegistry meterRegistry;
    
    @Override
    public Health health() {
        var builder = Health.up();
        
        // Verifica se há muitas operações falhando após retry
        var criticalFailures = getCriticalFailureRate();
        if (criticalFailures > 0.05) { // 5%
            builder.down()
                .withDetail("critical_failure_rate", criticalFailures)
                .withDetail("status", "HIGH_RETRY_FAILURE_RATE");
        }
        
        // Verifica se há circuit breakers abertos
        var openCircuitBreakers = getOpenCircuitBreakers();
        if (!openCircuitBreakers.isEmpty()) {
            builder.down()
                .withDetail("open_circuit_breakers", openCircuitBreakers)
                .withDetail("status", "CIRCUIT_BREAKERS_OPEN");
        }
        
        // Verifica latência de retries
        var p99Latency = getP99RetryLatency();
        if (p99Latency > Duration.ofSeconds(30)) {
            builder.down()
                .withDetail("p99_retry_latency_seconds", p99Latency.getSeconds())
                .withDetail("status", "HIGH_RETRY_LATENCY");
        }
        
        return builder
            .withDetail("active_retries", getActiveRetryCount())
            .withDetail("success_rate_5m", getSuccessRate5m())
            .build();
    }
}
```

### 3. Análise de Padrões de Falha

```java
@Service
public class RetryAnalyticsService {
    
    @Scheduled(fixedDelay = 300000) // A cada 5 minutos
    public void analyzeRetryPatterns() {
        
        // 1. Detecta operações com alta taxa de retry
        var highRetryOperations = findHighRetryOperations();
        for (var operation : highRetryOperations) {
            alertingService.sendAlert(AlertLevel.WARNING,
                "Alta taxa de retry detectada para operação: " + operation.getName() +
                " (Taxa: " + operation.getRetryRate() + "%)");
        }
        
        // 2. Identifica horários de pico de falhas
        var failurePatterns = analyzeFailureTimePatterns();
        if (failurePatterns.hasSignificantPattern()) {
            alertingService.sendAlert(AlertLevel.INFO,
                "Padrão de falhas identificado: " + failurePatterns.getDescription());
        }
        
        // 3. Sugere otimizações de configuração
        var optimizations = suggestRetryOptimizations();
        if (!optimizations.isEmpty()) {
            log.info("Sugestões de otimização de retry: {}", optimizations);
        }
    }
    
    private List<RetryOptimization> suggestRetryOptimizations() {
        var suggestions = new ArrayList<RetryOptimization>();
        
        // Analisa se alguma operação precisaria de mais/menos retries
        var operations = retryMetricsRepository.getOperationStats();
        
        for (var operation : operations) {
            if (operation.getSuccessRateAfterMaxRetries() > 0.8 && operation.getMaxRetries() < 5) {
                suggestions.add(new RetryOptimization(
                    operation.getName(),
                    "Aumentar maxRetries para " + (operation.getMaxRetries() + 2),
                    "80% das operações teriam sucesso com mais tentativas"
                ));
            }
            
            if (operation.getFirstAttemptSuccessRate() > 0.95 && operation.getMaxRetries() > 3) {
                suggestions.add(new RetryOptimization(
                    operation.getName(),
                    "Reduzir maxRetries para 2",
                    "95% das operações já sucedem na primeira tentativa"
                ));
            }
        }
        
        return suggestions;
    }
}
```

## Boas Práticas para Produção

### 1. Configuração Diferenciada por Ambiente

```yaml
# application-prod.yml
retry:
  banking:
    pix:
      max-retries: 5
      base-delay: 500ms
      max-delay: 15s
      multiplier: 1.8
      jitter: true
    
    ted:
      max-retries: 7
      base-delay: 1s
      max-delay: 30s
      multiplier: 1.5
      jitter: true
    
    score-consultation:
      max-retries: 3
      base-delay: 2s
      max-delay: 20s
      multiplier: 2.0
      jitter: true
      fallback-enabled: true

# application-dev.yml  
retry:
  banking:
    pix:
      max-retries: 2  # Falha mais rápido em dev
      base-delay: 100ms
      max-delay: 2s
```

### 2. Testes de Resiliência

```java
@ExtendWith(MockitoExtension.class)
class RetryResilienceTest {
    
    @Test
    void shouldRetryTransientFailuresAndEventuallySucceed() {
        // Given
        var mockService = mock(ExternalBankingService.class);
        when(mockService.processPayment(any()))
            .thenThrow(new SocketTimeoutException("Connection timeout"))  // 1ª tentativa
            .thenThrow(new ConnectException("Connection refused"))         // 2ª tentativa
            .thenReturn(new PaymentResult("SUCCESS", "txn-123"));          // 3ª tentativa
        
        var retryService = new SmartRetry(meterRegistry);
        var config = RetryConfig.builder()
            .maxRetries(3)
            .backoffStrategy(new FixedDelayStrategy(10)) // Teste rápido
            .build();
        
        // When
        var result = retryService.executeSmartRetry(
            () -> mockService.processPayment(new PaymentRequest()),
            "test-payment",
            config
        );
        
        // Then
        assertThat(result.getStatus()).isEqualTo("SUCCESS");
        verify(mockService, times(3)).processPayment(any());
    }
    
    @Test
    void shouldNotRetryNonRetryableExceptions() {
        // Given
        var mockService = mock(ExternalBankingService.class);
        when(mockService.processPayment(any()))
            .thenThrow(new IllegalArgumentException("Invalid account"));
        
        // When & Then
        assertThatThrownBy(() -> 
            retryService.executeSmartRetry(
                () -> mockService.processPayment(new PaymentRequest()),
                "test-payment",
                config
            )
        ).isInstanceOf(IllegalArgumentException.class);
        
        verify(mockService, times(1)).processPayment(any()); // Só 1 tentativa
    }
}
```

## Conclusão

Estratégias inteligentes de retry são fundamentais para a resiliência de sistemas bancários. Exponential backoff com jitter evita sobrecarga, while circuit breakers protegem contra falhas em cascata.

A implementação deve considerar a criticidade da operação: PIX e TED precisam de mais persistência, while consultas podem falhar mais rapidamente. Observabilidade detalhada permite otimização contínua das configurações.

### Principais benefícios:

- **Resiliência**: Operações críticas se recuperam de falhas transitórias
- **Performance**: Evita sobrecarga em sistemas já estressados  
- **Experiência**: Usuários não enfrentam falhas desnecessárias
- **Observabilidade**: Visibilidade total sobre padrões de falha
- **Otimização**: Ajuste contínuo baseado em dados reais

### Próximos passos:

No próximo artigo, exploraremos **Event Streaming com Kafka** para sistemas bancários, incluindo particionamento por conta, processamento em tempo real de transações e garantias de ordem em operações críticas.

