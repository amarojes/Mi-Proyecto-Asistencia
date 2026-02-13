
import * as Crypto from 'expo-crypto';

export const generateCompositePasswordHash = async (nombre, grado, seccion, cedula) => {
  const compositeString = `${nombre}${grado}${seccion}${cedula}`;
  const hashedPassword = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    compositeString
  );
  return hashedPassword;
};
