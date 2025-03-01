package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "permisos")
public class Permiso {
    @Id
    private String id;
    private String nombre;
    private String descripcion;

    // Constructor vacío
    public Permiso() {}

    // Constructor con parámetros
    public Permiso(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    // Getters y Setters
}
