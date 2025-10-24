# Frontend

Esta carpeta sigue una organización inspirada en proyectos estáticos modernos. La estructura principal queda de la siguiente forma:

```
frontend/
├── public/
│   ├── css/
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── pages/
│   │       ├── home.css
│   │       ├── news.css
│   │       ├── profile.css
│   │       ├── properties.css
│   │       ├── property-detail.css
│   │       └── register.css
│   └── images/
│       ├── hero/
│       ├── experiences/
│       ├── properties/
│       │   ├── property_11/
│       │   ├── property_12/
│       │   ├── property_13/
│       │   ├── property_14/
│       │   ├── property_15/
│       │   ├── property_16/
│       │   ├── property_17/
│       │   └── property_18/
│       └── icons/
├── src/
│   ├── assets/
│   │   └── icons/ (reservado para SVG sueltos)
│   ├── js/
│   │   ├── core/
│   │   │   └── app.js
│   │   ├── pages/
│   │   │   ├── home.js
│   │   │   ├── properties.js
│   │   │   ├── property-detail.js
│   │   │   └── register.js
│   │   └── profile/
│   │       ├── inicio.js
│   │       ├── leads.js
│   │       ├── messages.js
│   │       ├── mi-perfil.js
│   │       └── propiedades.js
│   ├── pages/
│   │   ├── index.html
│   │   ├── news.html
│   │   ├── news_detail.html
│   │   ├── profile.html
│   │   ├── properties.html
│   │   ├── property_detail.html
│   │   └── register.html
│   └── partials/
│       ├── footer.html
│       ├── header.html
│       └── profile/
│           ├── inicio.html
│           ├── leads.html
│           ├── mensajes.html
│           ├── mi-perfil.html
│           └── propiedades.html
└── README.md
```

Los archivos HTML dentro de `src/pages` referencian los assets de `public/` mediante rutas relativas (`../../public/...`). Si se monta un servidor estático, basta con exponer el contenido de `public/` como raíz de archivos estáticos y servir las páginas desde `src/pages`.

Los estilos globales (reset, tipografía y helpers) viven en `base.css`, mientras que la mayoría de reglas existentes permanecen en `layout.css` para mantener el comportamiento previo. Los archivos bajo `css/pages/` y `css/components.css` están listos para recibir estilos específicos en futuras iteraciones.
