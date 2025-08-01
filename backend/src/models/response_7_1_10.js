import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_7_1_10 extends Model {
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
    options: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: false
    },
    year: {
      type: DataTypes.DATE,
      allowNull: false
    },
    code_published: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    monitoring_committee: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ethics_programs: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    awareness_programs: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    report_links: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    additional_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_7_1_10',
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
        name: "fk_r7110_master",
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
