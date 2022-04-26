const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('role', {
        id :{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            allowNull: false, 
        },

        tipo: {
            type: DataTypes.ENUM("admin", "alumno", "instructor"),
            unique: true,
            primaryKey: true,
            allowNull: false,
        }

    })
}