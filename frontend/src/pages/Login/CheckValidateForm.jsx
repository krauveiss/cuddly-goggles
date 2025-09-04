export const CheckValidateForm = (data) => {
  const Errors = [];

  for (const [i, j] of Object.entries(data)) {
    switch (i) {
      case "password":
        if (j.length < 6) {
          Errors.push(`Слишком короткий пароль`);
        }
        break;
      case "name":
        if (j.length < 2) {
          Errors.push(`Слишком короткое имя`);
        }
    }
  }

  if (Errors.length > 0) {
    return [false, Errors];
  } else {
    return [true, Errors];
  }
};
