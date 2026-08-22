export function generateLoginId(companyPrefix = 'OI', fullName = 'Employee Name', joiningYear = new Date().getFullYear(), serialNum = 1) {
  const parts = fullName.trim().split(' ').filter(Boolean);
  
  let code = '';
  if (parts.length >= 2) {
    const firstTwo = parts[0].substring(0, 2).toUpperCase();
    const lastTwo = parts[parts.length - 1].substring(0, 2).toUpperCase();
    code = `${firstTwo}${lastTwo}`;
  } else if (parts.length === 1) {
    code = parts[0].substring(0, 4).toUpperCase().padEnd(4, 'X');
  } else {
    code = 'EMPL';
  }

  const serialStr = String(serialNum).padStart(4, '0');
  const yearStr = String(joiningYear);
  const prefixStr = (companyPrefix || 'OI').substring(0, 2).toUpperCase();

  return `${prefixStr}${code}${yearStr}${serialStr}`;
}

export function generateTempPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
