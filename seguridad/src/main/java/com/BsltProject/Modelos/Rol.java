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

    
    public void agregarPermiso(Permiso permiso) {
        if (permiso != null) {
            
            if (this.permisos == null) {
                this.permisos = new ArrayList<>();
            }

            
            boolean permisoExiste = this.permisos.stream()
                    .anyMatch(p -> Objects.equals(p.getId(), permiso.getId()));

            if (!permisoExiste) {
                this.permisos.add(permiso);
            } else {
            }
        }
    }

    
    public void eliminarPermiso(Permiso permiso) {
        if (permiso != null && this.permisos != null) {
            
            boolean eliminado = this.permisos.removeIf(p -> Objects.equals(p.getId(), permiso.getId()));

            if (eliminado) {
            } else {
            }
        }
    }

    
    public void eliminarPermisoPorId(String permisoId) {
        if (permisoId != null && this.permisos != null) {
            boolean eliminado = this.permisos.removeIf(p -> Objects.equals(p.getId(), permisoId));

            if (eliminado) {
            } else {
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