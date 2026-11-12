<script lang="ts">
  let {
    class: className = 'size-8',
    gradientId = 'ghost-mark-fill',
  }: { class?: string; gradientId?: string } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 108 100"
  class={`block overflow-visible ${className}`}
  aria-hidden="true"
  focusable="false"
>
  <defs>
    <linearGradient id={gradientId} x1="0.12" y1="0" x2="0.82" y2="1">
      <stop offset="0" stop-color="#FFFFFF" />
      <stop offset=".62" stop-color="#F8F7FC" />
      <stop offset="1" stop-color="#D8C9FF" />
    </linearGradient>
  </defs>
  <g class="ghost-float">
    <g class="ghost-react">
      <path
        class="ghost-body stroke-transparent stroke-[2.2] [stroke-linejoin:round]"
        d="M50 10.5 C34.1 10.5 23.1 21.8 20.5 37 C19.1 45.7 19.4 53.2 15 63.2 C11.9 70 9.7 75.1 13.1 79.2 C16.5 83.2 22.4 81 28.2 77.1 C30.8 83.3 36.4 87.1 43.1 87.1 C47.4 87.1 50.8 84.8 54.1 81.9 C57.6 85.5 61.8 87.7 66.6 86.9 C72.1 86 75.8 82.1 77.5 76.9 C82.3 80.5 88.1 81.1 91.1 77.2 C94.1 73.2 90.9 67.4 87.8 60.7 C84.6 53.7 84.1 45.2 82.6 37 C79.9 21.8 67.4 10.5 50 10.5 Z"
        fill={`url(#${gradientId})`}
      />
      <ellipse class="ghost-eye" cx="39.2" cy="43.4" rx="4.7" ry="7.25" fill="#17151F" />
      <path
        d="M57.8 45.2 L69.8 37.3 M57.8 45.2 L70 47.8"
        fill="none"
        stroke="#17151F"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <path
      class="ghost-star"
      d="M88 4 C90 11.7 93.2 15 101 17 C93.2 19 90 22.2 88 30 C86 22.2 82.8 19 75 17 C82.8 15 86 11.7 88 4 Z"
      fill="#FFC46B"
    />
  </g>
</svg>

<style>
  :global(html:not(.dark)) .ghost-body {
    stroke: #302b3a;
  }

  @media (prefers-reduced-motion: no-preference) {
    .ghost-float {
      transform-box: fill-box;
      transform-origin: center;
      animation: ghost-float 4.8s ease-in-out infinite;
    }
    .ghost-eye {
      transform-box: fill-box;
      transform-origin: center;
      animation: ghost-blink 6.4s ease-in-out infinite;
    }
    .ghost-star {
      transform-box: fill-box;
      transform-origin: center;
      animation: ghost-twinkle 3.6s ease-in-out infinite;
    }
    :global(.ghost-link:hover) .ghost-react,
    :global(.ghost-link:focus-visible) .ghost-react {
      transform-box: fill-box;
      transform-origin: center;
      animation: ghost-wink 320ms ease-in-out 1;
    }
    :global(.ghost-link:hover) .ghost-eye,
    :global(.ghost-link:focus-visible) .ghost-eye {
      animation: ghost-wink-eye 320ms ease-in-out 1;
    }

    @keyframes ghost-float {
      0%,
      100% {
        transform: translateY(0) rotate(0);
      }
      50% {
        transform: translateY(-3px) rotate(-1deg);
      }
    }
    @keyframes ghost-blink {
      0%,
      43%,
      47%,
      100% {
        transform: scaleY(1);
      }
      45% {
        transform: scaleY(0.08);
      }
    }
    @keyframes ghost-twinkle {
      0%,
      72%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      82% {
        opacity: 0.8;
        transform: scale(0.88) rotate(10deg);
      }
      92% {
        opacity: 1;
        transform: scale(1.06);
      }
    }
    @keyframes ghost-wink {
      0%,
      100% {
        transform: rotate(0);
      }
      45% {
        transform: rotate(2deg);
      }
    }
    @keyframes ghost-wink-eye {
      0%,
      100% {
        transform: scaleY(1);
      }
      45%,
      70% {
        transform: scaleY(0.08);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ghost-float,
    .ghost-eye,
    .ghost-star,
    .ghost-react {
      animation: none !important;
      transform: none !important;
    }
  }
</style>
