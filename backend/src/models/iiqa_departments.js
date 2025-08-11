import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class iiqa_departments extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      iiqa_form_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'iiqa_form',
          key: 'id'
        }
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      program: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      university: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      sra: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      affiliation_status: {
        type: DataTypes.ENUM('Temporary', 'Permanent'),
        allowNull: true
      },
      specialization: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'iiqa_departments',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }]
        },
        {
          name: "iiqa_form_id",
          using: "BTREE",
          fields: [{ name: "iiqa_form_id" }]
        }
      ]
    });
  }

  // Reverse association
  static associate(models) {
    this.hasMany(models.response_3_1_2, {
      foreignKey: 'department_of_principal_investigator',
      sourceKey: 'department',
      as: 'researchProjects'
    });
  }

  // in iiqa_departments model
static associate(models) {
  this.belongsTo(models.iiqa_form, {
    foreignKey: 'iiqa_form_id',
    as: 'iiqaForm'
  });
}

}
