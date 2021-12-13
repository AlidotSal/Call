export function animateTo(element, to, options) {
  const anim = element.animate(to, { ...options, fill: "both" });
  anim.addEventListener("finish", () => {
    anim.commitStyles();
    anim.cancel();
  });
  return anim;
}
