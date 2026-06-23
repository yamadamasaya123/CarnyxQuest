export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Primal password coordinates must have at least 6 characters."
    };
  }
  return { isValid: true, message: "" };
}

export function validateMealInput(name: string, weightG: number): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: "Prey meal description is required to track metabolic coordinates." };
  }
  if (weightG <= 0 || isNaN(weightG)) {
    return { isValid: false, error: "Acquired prey weight must be a positive integer." };
  }
  return { isValid: true };
}
