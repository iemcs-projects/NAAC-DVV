import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _criteria_master from  "./criteria_master.js";
import _extended_profile from  "./extended_profile.js";
import _file_uploads from  "./file_uploads.js";
import _hdr from  "./hdr.js";
import _iiqa_departments from  "./iiqa_departments.js";
import _iiqa_form from  "./iiqa_form.js";
import _iiqa_programme_count from  "./iiqa_programme_count.js";
import _iiqa_staff_details from  "./iiqa_staff_details.js";
import _iiqa_student_details from  "./iiqa_student_details.js";
import _iqac_supervision from  "./iqac_supervision.js";
import _response_1_1_3 from  "./response_1_1_3.js";
import _response_1_2_1 from  "./response_1_2_1.js";
import _response_1_2_2 from  "./response_1_2_2.js";
import _response_1_2_3 from  "./response_1_2_3.js";
import _response_1_3_2 from  "./response_1_3_2.js";
import _response_1_3_3 from  "./response_1_3_3.js";
import _response_1_4_1 from  "./response_1_4_1.js";
import _response_1_4_2 from  "./response_1_4_2.js";
import _response_2_1_1 from  "./response_2_1_1.js";
import _response_2_1_2 from  "./response_2_1_2.js";
import _response_2_2_2 from  "./response_2_2_2.js";
import _response_2_3_3 from  "./response_2_3_3.js";
import _response_2_4_1 from  "./response_2_4_1.js";
import _response_2_4_2 from  "./response_2_4_2.js";
import _response_2_4_3 from  "./response_2_4_3.js";
import _response_2_6_3 from  "./response_2_6_3.js";
import _response_2_7_1 from  "./response_2_7_1.js";
import _response_3_1_3 from  "./response_3_1_3.js";
import _response_3_2_1 from  "./response_3_2_1.js";
import _response_3_2_2 from  "./response_3_2_2.js";
import _response_3_3_2 from  "./response_3_3_2.js";
import _response_3_3_3 from  "./response_3_3_3.js";
import _response_3_4_1 from  "./response_3_4_1.js";
import _response_3_4_2 from  "./response_3_4_2.js";
import _response_4_1_3 from  "./response_4_1_3.js";
import _response_4_1_4 from  "./response_4_1_4.js";
import _response_4_2_2 from  "./response_4_2_2.js";
import _response_4_2_3 from  "./response_4_2_3.js";
import _response_4_2_4 from  "./response_4_2_4.js";
import _response_4_3_2 from  "./response_4_3_2.js";
import _response_4_4_1 from  "./response_4_4_1.js";
import _response_5_1_1 from  "./response_5_1_1.js";
import _response_5_1_2 from  "./response_5_1_2.js";
import _response_5_1_3 from  "./response_5_1_3.js";
import _response_5_1_4 from  "./response_5_1_4.js";
import _response_5_2_1 from  "./response_5_2_1.js";
import _response_5_2_2 from  "./response_5_2_2.js";
import _response_5_2_3 from  "./response_5_2_3.js";
import _response_5_3_1 from  "./response_5_3_1.js";
import _response_5_3_3 from  "./response_5_3_3.js";
import _response_6_2_3 from  "./response_6_2_3.js";
import _response_6_3_2 from  "./response_6_3_2.js";
import _response_6_3_3 from  "./response_6_3_3.js";
import _response_6_3_4 from  "./response_6_3_4.js";
import _response_6_4_2 from  "./response_6_4_2.js";
import _response_6_5_3 from  "./response_6_5_3.js";
import _response_7_1_10 from  "./response_7_1_10.js";
import _response_7_1_2 from  "./response_7_1_2.js";
import _response_7_1_4 from  "./response_7_1_4.js";
import _response_7_1_5 from  "./response_7_1_5.js";
import _response_7_1_6 from  "./response_7_1_6.js";
import _response_7_1_7 from  "./response_7_1_7.js";
import _scores from  "./scores.js";
import _users from  "./users.js";

export default function initModels(sequelize) {
  const criteria_master = _criteria_master.init(sequelize, DataTypes);
  const extended_profile = _extended_profile.init(sequelize, DataTypes);
  const file_uploads = _file_uploads.init(sequelize, DataTypes);
  const hdr = _hdr.init(sequelize, DataTypes);
  const iiqa_departments = _iiqa_departments.init(sequelize, DataTypes);
  const iiqa_form = _iiqa_form.init(sequelize, DataTypes);
  const iiqa_programme_count = _iiqa_programme_count.init(sequelize, DataTypes);
  const iiqa_staff_details = _iiqa_staff_details.init(sequelize, DataTypes);
  const iiqa_student_details = _iiqa_student_details.init(sequelize, DataTypes);
  const iqac_supervision = _iqac_supervision.init(sequelize, DataTypes);
  const response_1_1_3 = _response_1_1_3.init(sequelize, DataTypes);
  const response_1_2_1 = _response_1_2_1.init(sequelize, DataTypes);
  const response_1_2_2 = _response_1_2_2.init(sequelize, DataTypes);
  const response_1_2_3 = _response_1_2_3.init(sequelize, DataTypes);
  const response_1_3_2 = _response_1_3_2.init(sequelize, DataTypes);
  const response_1_3_3 = _response_1_3_3.init(sequelize, DataTypes);
  const response_1_4_1 = _response_1_4_1.init(sequelize, DataTypes);
  const response_1_4_2 = _response_1_4_2.init(sequelize, DataTypes);
  const response_2_1_1 = _response_2_1_1.init(sequelize, DataTypes);
  const response_2_1_2 = _response_2_1_2.init(sequelize, DataTypes);
  const response_2_2_2 = _response_2_2_2.init(sequelize, DataTypes);
  const response_2_3_3 = _response_2_3_3.init(sequelize, DataTypes);
  const response_2_4_1 = _response_2_4_1.init(sequelize, DataTypes);
  const response_2_4_2 = _response_2_4_2.init(sequelize, DataTypes);
  const response_2_4_3 = _response_2_4_3.init(sequelize, DataTypes);
  const response_2_6_3 = _response_2_6_3.init(sequelize, DataTypes);
  const response_2_7_1 = _response_2_7_1.init(sequelize, DataTypes);
  const response_3_1_3 = _response_3_1_3.init(sequelize, DataTypes);
  const response_3_2_1 = _response_3_2_1.init(sequelize, DataTypes);
  const response_3_2_2 = _response_3_2_2.init(sequelize, DataTypes);
  const response_3_3_2 = _response_3_3_2.init(sequelize, DataTypes);
  const response_3_3_3 = _response_3_3_3.init(sequelize, DataTypes);
  const response_3_4_1 = _response_3_4_1.init(sequelize, DataTypes);
  const response_3_4_2 = _response_3_4_2.init(sequelize, DataTypes);
  const response_4_1_3 = _response_4_1_3.init(sequelize, DataTypes);
  const response_4_1_4 = _response_4_1_4.init(sequelize, DataTypes);
  const response_4_2_2 = _response_4_2_2.init(sequelize, DataTypes);
  const response_4_2_3 = _response_4_2_3.init(sequelize, DataTypes);
  const response_4_2_4 = _response_4_2_4.init(sequelize, DataTypes);
  const response_4_3_2 = _response_4_3_2.init(sequelize, DataTypes);
  const response_4_4_1 = _response_4_4_1.init(sequelize, DataTypes);
  const response_5_1_1 = _response_5_1_1.init(sequelize, DataTypes);
  const response_5_1_2 = _response_5_1_2.init(sequelize, DataTypes);
  const response_5_1_3 = _response_5_1_3.init(sequelize, DataTypes);
  const response_5_1_4 = _response_5_1_4.init(sequelize, DataTypes);
  const response_5_2_1 = _response_5_2_1.init(sequelize, DataTypes);
  const response_5_2_2 = _response_5_2_2.init(sequelize, DataTypes);
  const response_5_2_3 = _response_5_2_3.init(sequelize, DataTypes);
  const response_5_3_1 = _response_5_3_1.init(sequelize, DataTypes);
  const response_5_3_3 = _response_5_3_3.init(sequelize, DataTypes);
  const response_6_2_3 = _response_6_2_3.init(sequelize, DataTypes);
  const response_6_3_2 = _response_6_3_2.init(sequelize, DataTypes);
  const response_6_3_3 = _response_6_3_3.init(sequelize, DataTypes);
  const response_6_3_4 = _response_6_3_4.init(sequelize, DataTypes);
  const response_6_4_2 = _response_6_4_2.init(sequelize, DataTypes);
  const response_6_5_3 = _response_6_5_3.init(sequelize, DataTypes);
  const response_7_1_10 = _response_7_1_10.init(sequelize, DataTypes);
  const response_7_1_2 = _response_7_1_2.init(sequelize, DataTypes);
  const response_7_1_4 = _response_7_1_4.init(sequelize, DataTypes);
  const response_7_1_5 = _response_7_1_5.init(sequelize, DataTypes);
  const response_7_1_6 = _response_7_1_6.init(sequelize, DataTypes);
  const response_7_1_7 = _response_7_1_7.init(sequelize, DataTypes);
  const scores = _scores.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);

  file_uploads.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(file_uploads, { as: "file_uploads", foreignKey: "criteria_code"});
  file_uploads.belongsTo(criteria_master, { as: "criteria_master", foreignKey: "criteria_master_id"});
  criteria_master.hasMany(file_uploads, { as: "criteria_master_file_uploads", foreignKey: "criteria_master_id"});
  hdr.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(hdr, { as: "hdrs", foreignKey: "criteria_code"});
  hdr.belongsTo(criteria_master, { as: "criteria_master", foreignKey: "criteria_master_id"});
  criteria_master.hasMany(hdr, { as: "criteria_master_hdrs", foreignKey: "criteria_master_id"});
  response_1_1_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_1_3, { as: "response_1_1_3s", foreignKey: "criteria_code"});
  response_1_1_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_1_3, { as: "id_response_1_1_3s", foreignKey: "id"});
  response_1_2_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_2_1, { as: "response_1_2_1s", foreignKey: "criteria_code"});
  response_1_2_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_2_1, { as: "id_response_1_2_1s", foreignKey: "id"});
  response_1_2_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_2_2, { as: "response_1_2_2s", foreignKey: "criteria_code"});
  response_1_2_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_2_2, { as: "id_response_1_2_2s", foreignKey: "id"});
  response_1_2_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_2_3, { as: "response_1_2_3s", foreignKey: "criteria_code"});
  response_1_2_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_2_3, { as: "id_response_1_2_3s", foreignKey: "id"});
  response_1_3_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_3_2, { as: "response_1_3_2s", foreignKey: "criteria_code"});
  response_1_3_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_3_2, { as: "id_response_1_3_2s", foreignKey: "id"});
  response_1_3_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_3_3, { as: "response_1_3_3s", foreignKey: "criteria_code"});
  response_1_3_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_3_3, { as: "id_response_1_3_3s", foreignKey: "id"});
  response_1_4_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_4_1, { as: "response_1_4_1s", foreignKey: "criteria_code"});
  response_1_4_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_4_1, { as: "id_response_1_4_1s", foreignKey: "id"});
  response_1_4_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_1_4_2, { as: "response_1_4_2s", foreignKey: "criteria_code"});
  response_1_4_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_1_4_2, { as: "id_response_1_4_2s", foreignKey: "id"});
  response_2_1_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_1_1, { as: "response_2_1_1s", foreignKey: "criteria_code"});
  response_2_1_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_1_1, { as: "id_response_2_1_1s", foreignKey: "id"});
  response_2_1_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_1_2, { as: "response_2_1_2s", foreignKey: "criteria_code"});
  response_2_1_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_1_2, { as: "id_response_2_1_2s", foreignKey: "id"});
  response_2_2_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_2_2, { as: "response_2_2_2s", foreignKey: "criteria_code"});
  response_2_2_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_2_2, { as: "id_response_2_2_2s", foreignKey: "id"});
  response_2_3_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_3_3, { as: "response_2_3_3s", foreignKey: "criteria_code"});
  response_2_3_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_3_3, { as: "id_response_2_3_3s", foreignKey: "id"});
  response_2_4_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_4_1, { as: "response_2_4_1s", foreignKey: "criteria_code"});
  response_2_4_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_4_1, { as: "id_response_2_4_1s", foreignKey: "id"});
  response_2_4_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_4_2, { as: "response_2_4_2s", foreignKey: "criteria_code"});
  response_2_4_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_4_2, { as: "id_response_2_4_2s", foreignKey: "id"});
  response_2_4_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_4_3, { as: "response_2_4_3s", foreignKey: "criteria_code"});
  response_2_4_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_4_3, { as: "id_response_2_4_3s", foreignKey: "id"});
  response_2_6_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_6_3, { as: "response_2_6_3s", foreignKey: "criteria_code"});
  response_2_6_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_6_3, { as: "id_response_2_6_3s", foreignKey: "id"});
  response_2_7_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_2_7_1, { as: "response_2_7_1s", foreignKey: "criteria_code"});
  response_2_7_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_2_7_1, { as: "id_response_2_7_1s", foreignKey: "id"});
  response_3_1_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_1_3, { as: "response_3_1_3s", foreignKey: "criteria_code"});
  response_3_1_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_1_3, { as: "id_response_3_1_3s", foreignKey: "id"});
  response_3_2_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_2_1, { as: "response_3_2_1s", foreignKey: "criteria_code"});
  response_3_2_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_2_1, { as: "id_response_3_2_1s", foreignKey: "id"});
  response_3_2_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_2_2, { as: "response_3_2_2s", foreignKey: "criteria_code"});
  response_3_2_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_2_2, { as: "id_response_3_2_2s", foreignKey: "id"});
  response_3_3_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_3_2, { as: "response_3_3_2s", foreignKey: "criteria_code"});
  response_3_3_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_3_2, { as: "id_response_3_3_2s", foreignKey: "id"});
  response_3_3_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_3_3, { as: "response_3_3_3s", foreignKey: "criteria_code"});
  response_3_3_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_3_3, { as: "id_response_3_3_3s", foreignKey: "id"});
  response_3_4_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_4_1, { as: "response_3_4_1s", foreignKey: "criteria_code"});
  response_3_4_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_4_1, { as: "id_response_3_4_1s", foreignKey: "id"});
  response_3_4_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_3_4_2, { as: "response_3_4_2s", foreignKey: "criteria_code"});
  response_3_4_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_3_4_2, { as: "id_response_3_4_2s", foreignKey: "id"});
  response_4_1_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_1_3, { as: "response_4_1_3s", foreignKey: "criteria_code"});
  response_4_1_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_1_3, { as: "id_response_4_1_3s", foreignKey: "id"});
  response_4_1_4.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_1_4, { as: "response_4_1_4s", foreignKey: "criteria_code"});
  response_4_1_4.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_1_4, { as: "id_response_4_1_4s", foreignKey: "id"});
  response_4_2_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_2_2, { as: "response_4_2_2s", foreignKey: "criteria_code"});
  response_4_2_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_2_2, { as: "id_response_4_2_2s", foreignKey: "id"});
  response_4_2_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_2_3, { as: "response_4_2_3s", foreignKey: "criteria_code"});
  response_4_2_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_2_3, { as: "id_response_4_2_3s", foreignKey: "id"});
  response_4_2_4.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_2_4, { as: "response_4_2_4s", foreignKey: "criteria_code"});
  response_4_2_4.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_2_4, { as: "id_response_4_2_4s", foreignKey: "id"});
  response_4_3_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_3_2, { as: "response_4_3_2s", foreignKey: "criteria_code"});
  response_4_3_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_3_2, { as: "id_response_4_3_2s", foreignKey: "id"});
  response_4_4_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_4_4_1, { as: "response_4_4_1s", foreignKey: "criteria_code"});
  response_4_4_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_4_4_1, { as: "id_response_4_4_1s", foreignKey: "id"});
  response_5_1_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_1_1, { as: "response_5_1_1s", foreignKey: "criteria_code"});
  response_5_1_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_1_1, { as: "id_response_5_1_1s", foreignKey: "id"});
  response_5_1_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_1_2, { as: "response_5_1_2s", foreignKey: "criteria_code"});
  response_5_1_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_1_2, { as: "id_response_5_1_2s", foreignKey: "id"});
  response_5_1_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_1_3, { as: "response_5_1_3s", foreignKey: "criteria_code"});
  response_5_1_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_1_3, { as: "id_response_5_1_3s", foreignKey: "id"});
  response_5_1_4.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_1_4, { as: "response_5_1_4s", foreignKey: "criteria_code"});
  response_5_1_4.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_1_4, { as: "id_response_5_1_4s", foreignKey: "id"});
  response_5_2_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_2_1, { as: "response_5_2_1s", foreignKey: "criteria_code"});
  response_5_2_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_2_1, { as: "id_response_5_2_1s", foreignKey: "id"});
  response_5_2_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_2_2, { as: "response_5_2_2s", foreignKey: "criteria_code"});
  response_5_2_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_2_2, { as: "id_response_5_2_2s", foreignKey: "id"});
  response_5_2_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_2_3, { as: "response_5_2_3s", foreignKey: "criteria_code"});
  response_5_2_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_2_3, { as: "id_response_5_2_3s", foreignKey: "id"});
  response_5_3_1.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_3_1, { as: "response_5_3_1s", foreignKey: "criteria_code"});
  response_5_3_1.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_3_1, { as: "id_response_5_3_1s", foreignKey: "id"});
  response_5_3_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_5_3_3, { as: "response_5_3_3s", foreignKey: "criteria_code"});
  response_5_3_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_5_3_3, { as: "id_response_5_3_3s", foreignKey: "id"});
  response_6_2_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_6_2_3, { as: "response_6_2_3s", foreignKey: "criteria_code"});
  response_6_2_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_6_2_3, { as: "id_response_6_2_3s", foreignKey: "id"});
  response_6_3_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_6_3_2, { as: "response_6_3_2s", foreignKey: "criteria_code"});
  response_6_3_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_6_3_2, { as: "id_response_6_3_2s", foreignKey: "id"});
  response_6_3_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_6_3_3, { as: "response_6_3_3s", foreignKey: "criteria_code"});
  response_6_3_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_6_3_3, { as: "id_response_6_3_3s", foreignKey: "id"});
  response_6_3_4.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_6_3_4, { as: "response_6_3_4s", foreignKey: "criteria_code"});
  response_6_3_4.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_6_3_4, { as: "id_response_6_3_4s", foreignKey: "id"});
  response_6_4_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_6_4_2, { as: "response_6_4_2s", foreignKey: "criteria_code"});
  response_6_4_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_6_4_2, { as: "id_response_6_4_2s", foreignKey: "id"});
  response_6_5_3.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_6_5_3, { as: "response_6_5_3s", foreignKey: "criteria_code"});
  response_6_5_3.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_6_5_3, { as: "id_response_6_5_3s", foreignKey: "id"});
  response_7_1_10.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_7_1_10, { as: "response_7_1_10s", foreignKey: "criteria_code"});
  response_7_1_10.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_7_1_10, { as: "id_response_7_1_10s", foreignKey: "id"});
  response_7_1_2.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_7_1_2, { as: "response_7_1_2s", foreignKey: "criteria_code"});
  response_7_1_2.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_7_1_2, { as: "id_response_7_1_2s", foreignKey: "id"});
  response_7_1_4.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_7_1_4, { as: "response_7_1_4s", foreignKey: "criteria_code"});
  response_7_1_4.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_7_1_4, { as: "id_response_7_1_4s", foreignKey: "id"});
  response_7_1_5.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_7_1_5, { as: "response_7_1_5s", foreignKey: "criteria_code"});
  response_7_1_5.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_7_1_5, { as: "id_response_7_1_5s", foreignKey: "id"});
  response_7_1_6.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_7_1_6, { as: "response_7_1_6s", foreignKey: "criteria_code"});
  response_7_1_6.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_7_1_6, { as: "id_response_7_1_6s", foreignKey: "id"});
  response_7_1_7.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(response_7_1_7, { as: "response_7_1_7s", foreignKey: "criteria_code"});
  response_7_1_7.belongsTo(criteria_master, { as: "id_criteria_master", foreignKey: "id"});
  criteria_master.hasMany(response_7_1_7, { as: "id_response_7_1_7s", foreignKey: "id"});
  scores.belongsTo(criteria_master, { as: "criteria_code_criteria_master", foreignKey: "criteria_code"});
  criteria_master.hasMany(scores, { as: "scores", foreignKey: "criteria_code"});
  extended_profile.belongsTo(iiqa_form, { as: "iiqa_form", foreignKey: "iiqa_form_id"});
  iiqa_form.hasMany(extended_profile, { as: "extended_profiles", foreignKey: "iiqa_form_id"});
  iiqa_departments.belongsTo(iiqa_form, { as: "iiqa_form", foreignKey: "iiqa_form_id"});
  iiqa_form.hasMany(iiqa_departments, { as: "iiqa_departments", foreignKey: "iiqa_form_id"});
  iiqa_programme_count.belongsTo(iiqa_form, { as: "iiqa_form", foreignKey: "iiqa_form_id"});
  iiqa_form.hasMany(iiqa_programme_count, { as: "iiqa_programme_counts", foreignKey: "iiqa_form_id"});
  iiqa_staff_details.belongsTo(iiqa_form, { as: "iiqa_form", foreignKey: "iiqa_form_id"});
  iiqa_form.hasMany(iiqa_staff_details, { as: "iiqa_staff_details", foreignKey: "iiqa_form_id"});
  iiqa_student_details.belongsTo(iiqa_form, { as: "iiqa_form", foreignKey: "iiqa_form_id"});
  iiqa_form.hasMany(iiqa_student_details, { as: "iiqa_student_details", foreignKey: "iiqa_form_id"});

  return {
    criteria_master,
    extended_profile,
    file_uploads,
    hdr,
    iiqa_departments,
    iiqa_form,
    iiqa_programme_count,
    iiqa_staff_details,
    iiqa_student_details,
    iqac_supervision,
    response_1_1_3,
    response_1_2_1,
    response_1_2_2,
    response_1_2_3,
    response_1_3_2,
    response_1_3_3,
    response_1_4_1,
    response_1_4_2,
    response_2_1_1,
    response_2_1_2,
    response_2_2_2,
    response_2_3_3,
    response_2_4_1,
    response_2_4_2,
    response_2_4_3,
    response_2_6_3,
    response_2_7_1,
    response_3_1_3,
    response_3_2_1,
    response_3_2_2,
    response_3_3_2,
    response_3_3_3,
    response_3_4_1,
    response_3_4_2,
    response_4_1_3,
    response_4_1_4,
    response_4_2_2,
    response_4_2_3,
    response_4_2_4,
    response_4_3_2,
    response_4_4_1,
    response_5_1_1,
    response_5_1_2,
    response_5_1_3,
    response_5_1_4,
    response_5_2_1,
    response_5_2_2,
    response_5_2_3,
    response_5_3_1,
    response_5_3_3,
    response_6_2_3,
    response_6_3_2,
    response_6_3_3,
    response_6_3_4,
    response_6_4_2,
    response_6_5_3,
    response_7_1_10,
    response_7_1_2,
    response_7_1_4,
    response_7_1_5,
    response_7_1_6,
    response_7_1_7,
    scores,
    users,
  };
}
