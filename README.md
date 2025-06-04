# Dashboard Pokémon

Una aplicación completa para explorar y analizar datos de Pokémon con gráficos interactivos y filtros.

## Características

- 📊 Gráficos columnares por tipo de Pokémon
- 🥧 Gráfico de torta para Pokémon legendarios
- 🔍 Filtros por nombre, tipo y estado legendario
- 🗃️ Base de datos MongoDB
- 📱 Diseño responsivo

## Requisitos Previos

- Node.js 18+ 
- MongoDB (local o Atlas)

## Instalación y Configuración

1. **Instalar dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configurar MongoDB:**
   - **Opción A - MongoDB Local:** 
     - Instala MongoDB Community Edition
     - Asegúrate de que esté ejecutándose en `mongodb://localhost:27017`
   - **Opción B - MongoDB Atlas (Recomendado):**
     - Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas)
     - Crea un cluster gratuito
     - Obtén la URI de conexión

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto:
   \`\`\`
   # Para MongoDB local:
   MONGODB_URI=mongodb://localhost:27017
   
   # Para MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/pokemon_db
   \`\`\`

4. **Poblar la base de datos:**
   \`\`\`bash
   npm run seed
   \`\`\`
   
   Deberías ver un mensaje como:
   \`\`\`
   ✅ 18 Pokémon insertados exitosamente
   🎉 ¡Base de datos poblada exitosamente!
   \`\`\`

5. **Ejecutar la aplicación:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Abrir en el navegador:**
   Ve a `http://localhost:3000`

## Uso

### Dashboard
- Visualiza gráficos de distribución por tipos
- Ve estadísticas de Pokémon legendarios vs normales
- Consulta estadísticas generales

### Explorador de Pokémon
- Filtra por nombre, tipo o estado legendario
- Ve detalles de cada Pokémon
- Navega por la colección completa

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/pokemon/          # API routes
│   └── page.tsx              # Página principal
├── components/
│   ├── charts/               # Componentes de gráficos
│   ├── pokemon-list.tsx      # Lista de Pokémon
│   └── pokemon-filters.tsx   # Filtros
├── lib/
│   ├── mongodb.ts            # Conexión a MongoDB
│   └── models/               # Modelos de datos
└── scripts/
    └── seed-pokemon.js       # Script de población
\`\`\`

## Tecnologías Utilizadas

- **Frontend:** Next.js 14, React, TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **Gráficos:** Recharts
- **Base de datos:** MongoDB
- **Styling:** Tailwind CSS

## Expandir la Aplicación

Para agregar más Pokémon, puedes:
1. Modificar el script `seed-pokemon.js` con más datos
2. Usar la API de PokéAPI para obtener datos reales
3. Implementar paginación para manejar grandes datasets

## Solución de Problemas

### Error de conexión a MongoDB
- **Local:** Verifica que MongoDB esté ejecutándose con `mongod`
- **Atlas:** Verifica que la URI sea correcta y que tu IP esté en la whitelist

### "Cannot read properties of undefined"
- Ejecuta `npm run seed` para poblar la base de datos
- Verifica que el archivo `.env.local` exista y tenga la URI correcta

### Puerto 3000 ocupado
\`\`\`bash
npm run dev -- -p 3001
