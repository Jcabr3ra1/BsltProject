package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "permisos")
public class Permiso {
    @Id
    private String id;
    private String nombre;
    private String descripcion;

    public Permiso() {}

    public Permiso(String nombre) {
        this.nombre = nombre;
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; } // ✅ SE AGREGA EL SETTER
}
