import { container } from 'tsyringe';

export const mapClass = (type: symbol, clazz: any) => {
  container.register(type, {
    useClass: clazz,
  });
};

export const mapValue = <T>(type: symbol, value: T) => {
  container.register(type, {
    useValue: value,
  });
};
