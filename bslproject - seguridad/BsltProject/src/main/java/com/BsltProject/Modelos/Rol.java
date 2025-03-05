package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "roles")
public class Rol {
    @Id
    private String id;
    private String nombre;

    @DBRef(lazy = false) // ✅ Se asegura que los permisos se carguen
    private List<Permiso> permisos = new ArrayList<>(); // ✅ Se inicializa la lista

    public Rol() {}

    public Rol(String nombre) {
        this.nombre = nombre;
        this.permisos = new ArrayList<>(); // ✅ Asegurar lista vacía en constructor
    }

    public Rol(String nombre, List<Permiso> permisos) {
        this.nombre = nombre;
        this.permisos = (permisos != null) ? permisos : new ArrayList<>(); // ✅ Evita `null`
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public List<Permiso> getPermisos() { return permisos; }

    public void setPermisos(List<Permiso> permisos) {
        this.permisos = (permisos != null) ? permisos : new ArrayList<>(); // ✅ Evita `null`
    }

    // ✅ Método para agregar permisos sin errores de `null`
    public void agregarPermiso(Permiso permiso) {
        if (permiso != null) {
            if (this.permisos == null) {
                this.permisos = new ArrayList<>(); // ✅ Inicializar si está `null`
            }
            this.permisos.add(permiso);
        }
    }
}
