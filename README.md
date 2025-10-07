# WMS Simulator

## Descrição

O WMS Simulator é uma aplicação web simples desenvolvida para simular e gerenciar layouts de depósitos ou armazéns (Warehouse Management System - WMS). A interface permite inserir endereços de armazenamento, gerar estruturas hierárquicas (ruas, prédios, níveis e apartamentos) e iniciar tours virtuais para navegação.

Esta ferramenta é útil para planejamento logístico, treinamento ou visualização de fluxos em ambientes de armazenamento.

## Recursos

- **Lista de Endereços**: Insira endereços no formato hierárquico (ex: A-01-01 ou A-01-01-01) para representar locais de armazenamento.
- **Geração de Depósito**: Crie automaticamente uma estrutura de armazém com ruas, prédios, níveis e apartamentos.
- **Iniciar Tour**: Navegue pelos endereços gerados em uma simulação interativa.
- **Estatísticas**: Visualize o número de ruas, prédios, níveis e apartamentos gerados.

## Como Usar

1. **Abra o Arquivo HTML**:
   - Salve o conteúdo do `wms2.html` em um arquivo com extensão `.html`.
   - Abra o arquivo em um navegador web moderno (Chrome, Firefox, etc.).

2. **Inserir Endereços**:
   - No campo "Lista de Endereços WMS", digite um endereço por linha no formato desejado (ex: `A-01-01` para Rua A, Prédio 01, Nível 01).

3. **Gerar Depósito**:
   - Clique no botão "Gerar Depósito" para criar a estrutura baseada nos endereços inseridos.
   - As estatísticas (Nº Ruas, Prédios, Níveis, Apartamentos) serão atualizadas automaticamente.

4. **Iniciar Tour**:
   - Após gerar o depósito, clique em "Iniciar Tour" para simular uma navegação pelos endereços.
   - O "Endereço atual" será exibido como N/A inicialmente e pode ser atualizado durante o tour (dependendo da implementação JavaScript).

## Estrutura do Arquivo

O arquivo `wms2.html` contém:
- Uma seção para exibição do endereço atual.
- Um formulário de texto para lista de endereços.
- Botão para iniciar o tour.
- Exibição de estatísticas.
- Botão para gerar o depósito.

A lógica de geração e tour é implementada via JavaScript (não visível no HTML fornecido, mas pode ser estendida).

## Tecnologias Utilizadas

- **HTML5**: Estrutura da página.
- **CSS**: Estilo básico (inline ou externo, conforme o HTML).
- **JavaScript**: Manipulação de dados e geração de estruturas (a ser implementado ou expandido).

## Instalação e Execução

Nenhuma instalação é necessária. Basta abrir o `wms2.html` no navegador.

## Contribuições

Sinta-se à vontade para fork o projeto, adicionar funcionalidades como exportação de layouts em JSON/CSV ou integração com APIs de logística.

## Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes (a ser criado se necessário).

## Contato

Para dúvidas ou sugestões, entre em contato via [seu email ou repositório].
