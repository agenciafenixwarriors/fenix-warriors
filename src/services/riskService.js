export function calculateRisk(warnings = []) {

  let pontos = 0;

  warnings.forEach((warning) => {

    if (warning.gravidade === "baixa") {

      pontos += 1;

    }

    if (warning.gravidade === "media") {

      pontos += 3;

    }

    if (warning.gravidade === "alta") {

      pontos += 6;

    }

  });

  if (pontos <= 2) {

    return {
      nivel: "baixo",
      cor: "green"
    };

  }

  if (pontos <= 6) {

    return {
      nivel: "medio",
      cor: "yellow"
    };

  }

  if (pontos <= 10) {

    return {
      nivel: "alto",
      cor: "orange"
    };

  }

  return {
    nivel: "critico",
    cor: "red"
  };

}