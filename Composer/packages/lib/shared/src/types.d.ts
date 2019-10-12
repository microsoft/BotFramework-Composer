declare module 'json-schema' {
  interface OBISchema {
    $schema?: string;
    $role?: string;
    $type?: string;
    type?: string;
    $copy?: string;
    description?: string;
    definitions?: any;
    $id?: string;
    $designer?: {
      [key: string]: any;
    };
  }

  interface JSONSchema6 extends OBISchema {
    title?: string;
    __additional_property?: boolean;
  }
}
