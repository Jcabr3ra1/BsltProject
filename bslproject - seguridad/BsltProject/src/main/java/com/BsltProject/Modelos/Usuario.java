package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.util.HashSet;
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

    private Set<Rol> roles = new HashSet<>(); // ✅ Inicializa los roles para evitar NullPointerException
    private Estado estado;
}
