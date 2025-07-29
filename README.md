# wplace.live Template Overlay Userscript

Este é um userscript para o site [wplace.live](https://wplace.live), criado para facilitar a sobreposição de templates personalizados no mapa do site, com uma interface moderna e controles intuitivos.

## Funcionalidades

- **Sobreposição de Imagem:** Permite adicionar uma imagem como overlay no mapa, seja por upload do seu computador ou por URL.
- **Interface Moderna:** Interface gráfica amigável para seleção de imagem, ajuste de opacidade, tamanho e posição.
- **Controles por Teclado:**
  - `WASD`: Move a imagem sobre o mapa
  - `Q/E`: Diminui/Aumenta a opacidade
  - `R/F`: Aumenta/Reduz o tamanho (zoom)
  - `ESC`: Remove o template
- **Notificações Visuais:** Feedback visual para ações e erros.
- **Botão Flutuante:** Botão fixo no canto superior direito para abrir a interface a qualquer momento.

## Como Usar

1. Instale uma extensão de userscript, como [Tampermonkey](https://www.tampermonkey.net/) ou [Violentmonkey](https://violentmonkey.github.io/).
2. Adicione o script [`wplace_template_script.js`](wplace_template_script.js) à sua extensão.
3. Acesse [wplace.live](https://wplace.live).
4. Clique no botão 🎨 no canto superior direito para abrir a interface.
5. Escolha uma imagem do seu PC ou insira uma URL de imagem.
6. Use os controles do teclado para ajustar a imagem conforme necessário.

## Controles Rápidos

- **Mover:** `W`, `A`, `S`, `D`
- **Opacidade:** `Q` (diminuir), `E` (aumentar)
- **Tamanho:** `R` (aumentar), `F` (diminuir)
- **Remover template:** `ESC`

## Observações

- O script não interfere no funcionamento do site, apenas adiciona uma camada visual para facilitar a colaboração.
- Nenhum dado é enviado para servidores externos.

## Licença

MIT
