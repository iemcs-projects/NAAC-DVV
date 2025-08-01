import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_1_2_1 extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sl_no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'id'
      }
    },
    criteria_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'criteria_master',
        key: 'criteria_code'
      }
    },
    session: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    programme_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    programme_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    year_of_introduction: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status_of_implementation_of_CBCS: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    year_of_implementation_of_CBCS: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year_of_revision: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prc_content_added: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_1_2_1',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sl_no" },
        ]
      },
      {
        name: "idx_r121_criteria",
        using: "BTREE",
        fields: [
          { name: "criteria_code" },
          { name: "id" },
        ]
      },
    ]
  });
  }
}
