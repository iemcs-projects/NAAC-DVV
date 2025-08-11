import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class iiqa_form extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    institution_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_start_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_end_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year_filled: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    naac_cycle: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    desired_grade: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    has_mou: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    mou_file_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pending','Submitted','Approved','Rejected'),
      allowNull: true,
      defaultValue: "Pending"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'iiqa_form',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "institution_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "institution_id" },
          { name: "year_filled" },
        ]
      },
    ]
  });
  }

  // in iiqa_form model
static associate(models) {
  this.hasMany(models.iiqa_departments, {
    foreignKey: 'iiqa_form_id',
    as: 'departments'
  });
}
}
