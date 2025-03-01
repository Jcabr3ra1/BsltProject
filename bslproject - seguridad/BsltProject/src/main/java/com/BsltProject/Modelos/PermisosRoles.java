package com.BsltProject.Modelos;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

@Document(collection = "permisos_roles") // 🔹 Definirlo como una colección en MongoDB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermisosRoles {

    @Id
    private String id; // 🔹 Cambié Long por String

    private Rol rol;
    private Permiso permiso;
}
