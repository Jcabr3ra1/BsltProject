package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "roles")
public class Rol {
    @Id
    private String id;
    private String nombre;

    @DBRef
    private List<Permiso> permisos;

    public Rol() {
        this.permisos = new ArrayList<>();
    }

    public Rol(String nombre) {
        this.nombre = nombre;
        this.permisos = new ArrayList<>();
    }

    public Rol(String nombre, List<Permiso> permisos) {
        this.nombre = nombre;
        this.permisos = (permisos != null) ? new ArrayList<>(permisos) : new ArrayList<>();
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<Permiso> getPermisos() {
        return permisos != null ? new ArrayList<>(permisos) : new ArrayList<>();
    }

    public void setPermisos(List<Permiso> permisos) {
        this.permisos = (permisos != null) ? new ArrayList<>(permisos) : new ArrayList<>();
    }

    // Método para agregar permisos sin errores de `null`
    public void agregarPermiso(Permiso permiso) {
        if (permiso != null) {
            // Inicializar si es null
            if (this.permisos == null) {
                this.permisos = new ArrayList<>();
            }

            // Verificar si el permiso ya está en la lista usando equals
            boolean permisoExiste = this.permisos.stream()
                    .anyMatch(p -> Objects.equals(p.getId(), permiso.getId()));

            if (!permisoExiste) {
                this.permisos.add(permiso);
                System.out.println("✅ Permiso añadido: " + permiso.getNombre());
            } else {
                System.out.println("⚠️ Permiso ya existente: " + permiso.getNombre());
            }
        }
    }

    // Método para eliminar un permiso específico
    public void eliminarPermiso(Permiso permiso) {
        if (permiso != null && this.permisos != null) {
            // Eliminar el permiso basándose en el ID
            boolean eliminado = this.permisos.removeIf(p -> Objects.equals(p.getId(), permiso.getId()));

            if (eliminado) {
                System.out.println("✅ Permiso eliminado: " + permiso.getNombre());
            } else {
                System.out.println("⚠️ Permiso no encontrado: " + permiso.getNombre());
            }
        }
    }

    // Método alternativo para eliminar por ID
    public void eliminarPermisoPorId(String permisoId) {
        if (permisoId != null && this.permisos != null) {
            boolean eliminado = this.permisos.removeIf(p -> Objects.equals(p.getId(), permisoId));

            if (eliminado) {
                System.out.println("✅ Permiso eliminado con ID: " + permisoId);
            } else {
                System.out.println("⚠️ Permiso con ID no encontrado: " + permisoId);
            }
        }
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Rol rol = (Rol) o;
        return Objects.equals(id, rol.id) &&
                Objects.equals(nombre, rol.nombre);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nombre);
    }

    @Override
    public String toString() {
        return "Rol{" +
                "id='" + id + '\'' +
                ", nombre='" + nombre + '\'' +
                ", permisos=" + (permisos != null ? permisos.size() : "null") +
                '}';
    }
}