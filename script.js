// LISTA DE PALABRAS RESERVADAS DE C 
const palabrasReservadas = new Set([
    "auto", "break", "case", "char", "const", "continue", "default", "do",
    "double", "else", "enum", "extern", "float", "for", "goto", "if",
    "int", "long", "register", "return", "short", "signed", "sizeof", "static",
    "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while",
    "include", "define", "main", "printf", "scanf" 
]);

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('sourceCode').value = e.target.result;
    };
    reader.readAsText(file);
});

function iniciarScanner() {
    const code = document.getElementById('sourceCode').value;
    const tokens = escanearCodigo(code);
    mostrarResultados(tokens);
}

function escanearCodigo(input) {
    let cursor = 0;
    const length = input.length;
    const tokens = [];

    // Definición de estadísticas
    const stats = {
        'Palabra Reservada': 0,
        'Variable (ID)': 0,
        'Número Entero': 0,
        'Número Real': 0,
        'Operador': 0,
        'Comentario': 0  
    };

    while (cursor < length) {
        let resto = input.slice(cursor);

        // 1. IGNORAR ESPACIOS EN BLANCO
        let match = resto.match(/^\s+/);
        if (match) {
            cursor += match[0].length;
            continue;
        }

        // 2. DETECTAR COMENTARIOS 
        
        // 2a. Comentario de Bloque /* ... */
        match = resto.match(/^\/\*[\s\S]*?\*\//); 
        if (match) {
            let val = match[0];
            // Guardamos el token en lugar de solo saltarlo
            tokens.push({ valor: val, tipo: 'Comentario (Bloque)', css: 'type-comentario' });
            stats['Comentario']++; 
            cursor += val.length;
            continue; 
        }

        // 2b. Comentario de Línea // ...
        match = resto.match(/^\/\/.*/);
        if (match) {
            let val = match[0];
            // Guardamos el token en lugar de solo saltarlo
            tokens.push({ valor: val, tipo: 'Comentario (Línea)', css: 'type-comentario' });
            stats['Comentario']++; 
            cursor += val.length;
            continue; 
        }

        // 3. DETECTAR NÚMEROS REALES
        match = resto.match(/^\d+\.\d+/);
        if (match) {
            let val = match[0];
            tokens.push({ valor: val, tipo: 'Número Real', css: 'type-real' });
            stats['Número Real']++;
            cursor += val.length;
            continue;
        }

        // 4. DETECTAR NÚMEROS ENTEROS
        match = resto.match(/^\d+/);
        if (match) {
            let val = match[0];
            tokens.push({ valor: val, tipo: 'Número Entero', css: 'type-entero' });
            stats['Número Entero']++;
            cursor += val.length;
            continue;
        }

        // 5. DETECTAR PALABRAS (Identificadores o Reservadas)
        match = resto.match(/^[a-zA-Z_]\w*/);
        if (match) {
            let val = match[0];
            if (palabrasReservadas.has(val)) {
                tokens.push({ valor: val, tipo: 'Palabra Reservada', css: 'type-reservada' });
                stats['Palabra Reservada']++;
            } else {
                tokens.push({ valor: val, tipo: 'Variable (ID)', css: 'type-variable' });
                stats['Variable (ID)']++;
            }
            cursor += val.length;
            continue;
        }

        // 6. DETECTAR OPERADORES
        match = resto.match(/^(==|!=|<=|>=|&&|\|\||\+\+|--|[+\-*\/%=<>!&|^])/);
        if (match) {
            let val = match[0];
            tokens.push({ valor: val, tipo: 'Operador', css: 'type-operador' });
            stats['Operador']++;
            cursor += val.length;
            continue;
        }

        // 7. OTROS (Separadores)
        tokens.push({ valor: input[cursor], tipo: 'Otro/Separador', css: '' });
        cursor++;
    }

    return { list: tokens, stats: stats };
}

function mostrarResultados(data) {
    document.getElementById('outputArea').style.display = 'block';
    
    // Llenar tabla de estadísticas
    const statsBody = document.querySelector('#statsTable tbody');
    statsBody.innerHTML = '';
    for (let [key, value] of Object.entries(data.stats)) {
        let row = `<tr><td>${key}</td><td>${value}</td></tr>`;
        statsBody.innerHTML += row;
    }

    // Llenar tabla de tokens
    const tokensBody = document.querySelector('#tokensTable tbody');
    tokensBody.innerHTML = '';
    data.list.forEach((token, index) => {
        // En caso de comentarios largos, cortamos el texto visualmente si es muy largo para que no rompa la tabla
        let valorVisual = token.valor;
        if(token.valor.length > 50) valorVisual = token.valor.substring(0, 50) + "...";

        let row = `<tr class="${token.css}">
                    <td>${index + 1}</td>
                    <td style="white-space: pre-wrap; font-family: monospace;">${escapeHtml(valorVisual)}</td>
                    <td>${token.tipo}</td>
                   </tr>`;
        tokensBody.innerHTML += row;
    });
}

// Función auxiliar simple para evitar que caracteres como < o > rompan el HTML de la tabla
function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}