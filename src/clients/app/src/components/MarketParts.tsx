const STRIPES = Array.from({ length: 8 }, (_, index) => index);

/** Auvent rayé de 320 de large (huit bandes), à festons ; `height` est la hauteur avant les festons. */
export function Awning({ height }: { readonly height: number }) {
  return (
    <g data-part="awning">
      {STRIPES.map((index) => (
        <g key={index} className={index % 2 === 0 ? "fill-primary" : "fill-card"}>
          <rect x={index * 40} y="0" width="40" height={height} />
          <path d={`M ${index * 40} ${height} a 20 20 0 0 0 40 0 z`} />
        </g>
      ))}
    </g>
  );
}

interface BottleProps {
  /** Centre de la bouteille. */
  readonly x: number;
  /** Ordonnée du pied (posé sur le comptoir). */
  readonly baseY: number;
  /** Classe de remplissage du corps (jeton de couleur). */
  readonly body: string;
}

/** Bouteille de bissap de 28 de large et 68 de haut, étiquette blanche. */
export function Bottle({ x, baseY, body }: BottleProps) {
  return (
    <g data-part="bottle">
      <rect x={x - 7} y={baseY - 68} width="14" height="8" rx="3" className="fill-foreground" />
      <rect x={x - 6} y={baseY - 62} width="12" height="18" className={body} />
      <rect x={x - 14} y={baseY - 48} width="28" height="48" rx="8" className={body} />
      <rect x={x - 14} y={baseY - 32} width="28" height="14" className="fill-card" />
    </g>
  );
}
