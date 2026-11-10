import React from 'react';

/*
 * Least squares as orthogonal projection: y lives in R^n, the model can only
 * reach the plane spanned by X's columns, and the best reachable point ŷ is
 * the foot of the perpendicular from y. Schematic (n = 3, two columns).
 */
const ProjectionDiagram: React.FC = () => (
  <figure className="figure lrx-diagram">
    <svg
      viewBox="0 0 600 320"
      role="img"
      aria-labelledby="proj-title proj-desc"
      className="lrx-diagram__svg"
    >
      <title id="proj-title">Least squares as orthogonal projection</title>
      <desc id="proj-desc">
        A tilted plane labelled column space of X contains two column vectors
        starting at the origin. The target vector y rises out of the plane. Its
        projection y-hat lies in the plane directly below it, and the residual
        vector from y-hat up to y meets the plane at a right angle.
      </desc>
      <defs>
        <marker
          id="proj-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="lrx-diagram__head" />
        </marker>
        <marker
          id="proj-arrow-accent"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="lrx-diagram__head--accent" />
        </marker>
      </defs>

      <polygon
        className="lrx-diagram__plane"
        points="40,262 430,262 560,168 170,168"
      />
      <text className="lrx-diagram__note" x="40" y="292">
        The plane: the column space of X,
      </text>
      <text className="lrx-diagram__note" x="40" y="309">
        every vector Xθ the model can produce
      </text>

      {/* columns of X */}
      <line
        className="lrx-diagram__col"
        x1="130"
        y1="236"
        x2="300"
        y2="246"
        markerEnd="url(#proj-arrow)"
      />
      <text className="lrx-diagram__label" x="308" y="250">
        x₀ = 1
      </text>
      <line
        className="lrx-diagram__col"
        x1="130"
        y1="236"
        x2="230"
        y2="190"
        markerEnd="url(#proj-arrow)"
      />
      <text className="lrx-diagram__label" x="240" y="198">
        x₁
      </text>

      {/* y and its projection */}
      <line
        className="lrx-diagram__vec"
        x1="130"
        y1="236"
        x2="388"
        y2="52"
        markerEnd="url(#proj-arrow)"
      />
      <text
        className="lrx-diagram__label lrx-diagram__label--strong"
        x="396"
        y="48"
      >
        y
      </text>
      <line
        className="lrx-diagram__vec lrx-diagram__vec--accent"
        x1="130"
        y1="236"
        x2="388"
        y2="214"
        markerEnd="url(#proj-arrow-accent)"
      />
      <text
        className="lrx-diagram__label lrx-diagram__label--accent"
        x="396"
        y="232"
      >
        ŷ, the fitted values
      </text>

      {/* residual, perpendicular to the plane */}
      <line className="lrx-diagram__resid" x1="390" y1="212" x2="390" y2="58" />
      <path className="lrx-diagram__right" d="M390,198 h12 v12" />
      <text className="lrx-diagram__label" x="402" y="112">
        r = y − ŷ
      </text>
      <text className="lrx-diagram__note" x="402" y="130">
        perpendicular to every column:
      </text>
      <text className="lrx-diagram__note" x="402" y="147">
        Xᵀr = 0
      </text>

      <circle className="lrx-diagram__origin" cx="130" cy="236" r="3.5" />
      <text className="lrx-diagram__note" x="104" y="232" textAnchor="end">
        0
      </text>
    </svg>
    <figcaption className="figure__caption">
      With n examples, y is one point in n-dimensional space. Changing θ moves
      Xθ only within the plane spanned by the columns of X. The closest point in
      that plane is the one where the leftover vector r stands at a right angle
      to the plane, and that right angle is exactly the normal equations.
    </figcaption>
  </figure>
);

export default ProjectionDiagram;
