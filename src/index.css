@import "tailwindcss";

/* Theme colors — configurable via the admin panel (Configurações > Tema Visual). 
   Only two hex values are needed; hover/darker/lighter shades are derived with color-mix(). */
:root {
  --wb-primary: #ec4899;
  --wb-primary-dark: color-mix(in srgb, var(--wb-primary) 82%, black);
  --wb-primary-light: color-mix(in srgb, var(--wb-primary) 65%, white);
  --wb-accent: #f59e0b;
  --wb-accent-dark: color-mix(in srgb, var(--wb-accent) 82%, black);
}

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(24, 24, 27, 0.6);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--wb-primary) 40%, transparent);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--wb-primary) 80%, transparent);
  }
}



/* Woobox visual refinement: calmer surfaces, clearer hierarchy. */
html {
  background: #050508;
}

body {
  margin: 0;
  background: #050508;
  color: #f4f4f5;
}

::selection {
  background: color-mix(in srgb, var(--wb-primary) 65%, transparent);
  color: white;
}

button, a, input, select {
  -webkit-tap-highlight-color: transparent;
}

/* Kept as a restrained emphasis for the top product, without animated glow. */
.woobox-hot-glow {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--wb-primary) 22%, transparent);
}
