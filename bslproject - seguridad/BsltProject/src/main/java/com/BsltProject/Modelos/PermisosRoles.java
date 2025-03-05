package com.BsltProject.Modelos;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "permisos_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PermisosRoles {

    @Id
    private String id;

    @DBRef // 🔹 Hace que MongoDB almacene la referencia completa del rol
    private Rol rol;

    @DBRef // 🔹 Hace que MongoDB almacene la referencia completa del permiso
    private Permiso permiso;
}
