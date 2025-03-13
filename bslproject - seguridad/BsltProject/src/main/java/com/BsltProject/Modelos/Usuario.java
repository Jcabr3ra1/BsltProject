package com.BsltProject.Modelos;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Document(collection = "usuarios") // Define que esta clase será una colección en MongoDB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    private String id; // MongoDB usa String como ID

    private String email;
    private String nombre;
    private String password;

    private String cuentaId; // ✅ Solo almacenamos el ID de la cuenta

    @Transient // No se almacena en la base de datos, se obtiene dinámicamente
    private Map<String, Object> cuenta; // Se llenará con datos en tiempo real del backend financiero

    @DBRef // Cambiado a DBRef simple sin lazy=false
    private Set<Rol> roles = new HashSet<>();

    @JsonInclude(JsonInclude.Include.NON_EMPTY) // 🔥 Evita que se muestre cuando está vacío
    @DBRef // Cambiado a DBRef simple sin lazy=false
    private Set<Permiso> permisos;

    @DBRef // Añadido DBRef para el estado
    private Estado estado;
}
