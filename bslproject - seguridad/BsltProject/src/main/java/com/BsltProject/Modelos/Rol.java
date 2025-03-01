package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.util.Set;

@Document(collection = "roles") // 🔹 Ahora es una colección en MongoDB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Rol {

    @Id
    private String id; // 🔹 Cambié Long por String

    private String nombre;

    private Set<Permiso> permisos;
}
