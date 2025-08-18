---
title: 'O que é o Saga Pattern?'
description: 'O Saga Pattern é uma estratégia de controle de transações distribuídas, que busca resolver o problema da consistência eventual em microsserviços.'
pubDate: '2024-12-30'
---

O **Saga Pattern** é uma estratégia de controle de transações distribuídas, que busca resolver o problema da consistência eventual em microsserviços.

Em vez de depender de um 2PC (Two-Phase Commit) — caro e pouco escalável — o Saga se baseia em sequência de transações locais coordenadas e ações de compensação em caso de falhas.

**Cada serviço executa uma operação local** e, caso algo dê errado depois, executa uma transação compensatória para desfazer o que já foi feito.

## Dois estilos principais

O Saga Pattern pode ser implementado de duas formas:

### 1. Orquestração

Existe um **orquestrador central** que coordena todo o fluxo.

- Ele envia comandos para cada serviço na ordem correta.
- Se algo falhar, o orquestrador dispara as compensações necessárias.

**Exemplo prático:**

Um serviço de `Order Service` atua como orquestrador. Ele chama o `Inventory Service`, depois o `Payment Service`, e por fim o `Shipping Service`.

Caso o pagamento falhe, o orquestrador manda o `Inventory` liberar o estoque.

**Vantagens:**
- Fluxo mais previsível
- Fácil de entender e monitorar
- Uma "visão única" do processo

**Desvantagens:**
- O orquestrador pode virar um ponto único de falha
- Tende a ser mais acoplado

### 2. Coreografia

Não há um orquestrador central.

- Cada serviço reage a eventos emitidos por outros serviços
- O fluxo é construído a partir da troca de mensagens

**Exemplo prático:**

1. O `Order Service` publica um evento `OrderCreated`
2. O `Inventory Service` escuta e reserva o estoque
3. Ele emite um `InventoryReserved`
4. O `Payment Service` escuta e processa o pagamento
5. Se falhar, publica `PaymentFailed`, e o `Inventory` libera o estoque automaticamente

**Vantagens:**
- Mais desacoplado e escalável
- Serviços podem evoluir de forma independente

**Desvantagens:**
- O fluxo pode se tornar difícil de rastrear ("dança dos eventos")
- Debug e monitoramento são mais complexos

## Orquestração vs Coreografia: Qual usar?

### Use **Orquestração** quando:
- O fluxo é crítico e precisa de visibilidade clara
- Você quer centralizar lógica de negócios complexa

### Use **Coreografia** quando:
- O sistema precisa ser altamente escalável e desacoplado
- Você tem muitos serviços independentes que podem evoluir sozinhos

**Muitas arquiteturas híbridas** usam os dois:
- **Orquestração** para processos críticos e previsíveis
- **Coreografia** para fluxos mais simples e altamente distribuídos

## Conclusão

O Saga Pattern é essencial para quem constrói aplicações distribuídas modernas.

Dominar a diferença entre **Orquestração** e **Coreografia** é fundamental para escolher a abordagem certa em cada cenário.

**Pontos-chave a considerar:**
- Complexidade do fluxo
- Nível de acoplamento aceitável
- Facilidade de monitoramento e manutenção

No fim das contas, não existe bala de prata — mas entender as diferenças é o que garante que o sistema seja **resiliente**, **consistente** e **escalável**. 