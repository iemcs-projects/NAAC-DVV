export const rolesCriteria = {
  college_admin: {
    criteria: [
      "1.1.1","1.1.2","1.3.1","1.4.2",
      "2.1.1","2.1.2","2.2.1","2.2.2","2.5.2","2.7.1",
      "3.1.1","3.1.2","3.1.3","3.4.2",
      "4.1.1","4.1.2","4.1.3","4.1.4","4.2.3","4.3.1","4.3.2","4.3.4",
      "4.4.1","4.4.2",
      "5.1.4","5.1.5","5.3.1","5.4.1","5.4.2",
      "6.1.1","6.12","6.2.1","6.2.2","6.2.3","6.3.3","6.3.5",
      "6.4.1","6.4.2","6.4.3",
      "6.5.1","6.5.2","6.5.3",
      "7.1.1","7.1.2","7.1.3","7.1.4","7.1.5","7.1.6","7.1.7","7.1.8","7.1.9","7.1.10","7.1.11",
      "7.2.1"
    ]
  },
  faculty: {
    criteria: [
      "1.1.3","1.2.1","1.2.2","1.2.3","1.3.1","1.3.2","1.3.3","1.4.1",
      "2.2.1","2.2.2","2.3.1","2.3.2","2.3.3","2.5.2","2.6.1","2.6.2","2.6.3","2.7.1",
      "3.2.1","3.2.2","3.3.1","3.3.2","3.4.1",
      "4.2.4",
      "5.1.3",
      "6.3.4","6.3.1","6.3.2"
    ]
  },
  mentor: {
    criteria: [
      "2.3.1","2.3.3","2.6.1","3.3.3","3.3.4","3.4.1",
      "4.2.1","4.2.2","5.1.1","5.1.2","5.2.1","5.2.2","5.2.3","5.3.2","5.3.3"
    ]
  },
  hod: {
    criteria: ["2.4.1","2.4.2","2.4.3","2.5.1"]
  }
};

export const criteriaControllers = {
  // CRITERIA 1
  "1.1.3": ["createResponse113","updateResponse113","deleteResponse113","score113"],
  "1.2.1": ["createResponse121","updateResponse121","deleteResponse121","score121"],
  "1.2.2": ["createResponse122_123","updateResponse122_123","deleteResponse122_123","score122"],
  "1.2.3": ["createResponse122_123","updateResponse122_123","deleteResponse122_123","score123"],
  "1.3.1": ["getResponsesByCriteriaCode"],
  "1.3.2": ["createResponse132","updateResponse132","deleteResponse132","score132"],
  "1.3.3": ["createResponse133","updateResponse133","deleteResponse133","score133"],
  "1.4.1": ["createResponse141","updateResponse141","deleteResponse141","score141"],
  "1.4.2": ["createResponse142","updateResponse142","deleteResponse142","score142"],
  "1.x": ["getResponsesByCriteriaCode"],

  // CRITERIA 2
  "2.1.1": ["createResponse211","updateResponse211","deleteResponse211","score211"],
  "2.1.2": ["createResponse212","updateResponse212","deleteResponse212","score212"],
  "2.2.1": ["getResponsesByCriteriaCode"],
  "2.2.2": ["createResponse222_241_243","updateResponse222_241_243","deleteResponse222_241_243","score222"],
  "2.3.1": ["createResponse233","updateResponse233","deleteResponse233","score233"],
  "2.3.2": ["getResponsesByCriteriaCode"],
  "2.3.3": ["createResponse233","updateResponse233","deleteResponse233","score233"],
  "2.4.1": ["createResponse222_241_243","updateResponse222_241_243","deleteResponse222_241_243","score241"],
  "2.4.2": ["createResponse242","updateResponse242","deleteResponse242","score242"],
  "2.4.3": ["createResponse222_241_243","updateResponse222_241_243","deleteResponse222_241_243","score243"],
  "2.5.2": ["getResponsesByCriteriaCode"],
  "2.6.1": ["getResponsesByCriteriaCode"],
  "2.6.2": ["getResponsesByCriteriaCode"],
  "2.6.3": ["createResponse263","updateResponse263","deleteResponse263","score263"],
  "2.7.1": ["createResponse271","score271"],
  "2.x": ["getResponsesByCriteriaCode"],

  // CRITERIA 3
  "3.1.1": ["createResponse311_312","updateResponse311_312","deleteResponse311_312","score311"],
  "3.1.2": ["createResponse311_312","updateResponse311_312","deleteResponse311_312","score312"],
  "3.1.3": ["createResponse313","updateResponse313","deleteResponse313","score313"],
  "3.2.1": ["createResponse321","updateResponse321","deleteResponse321","score321"],
  "3.2.2": ["createResponse322","updateResponse322","deleteResponse322","score322"],
  "3.3.1": ["getResponsesByCriteriaCode"],
  "3.3.2": ["createResponse332","updateResponse332","deleteResponse332","score332"],
  "3.3.3": ["createResponse333","updateResponse333","deleteResponse333","score333"],
  "3.3.4": ["createResponse334","updateResponse334","deleteResponse334","score334"],
  "3.4.1": ["createResponse341","updateResponse341","deleteResponse341","score341"],
  "3.4.2": ["createResponse342","updateResponse342","deleteResponse342","score342"],
  "3.x": ["getResponsesByCriteriaCode"],

  // CRITERIA 4
  "4.1.1": ["createResponse414_441","updateResponse414_441","deleteResponse414_441","score414"],
  "4.1.2": ["getResponsesByCriteriaCode"],
  "4.1.3": ["createResponse413","updateResponse413","deleteResponse413","score413"],
  "4.1.4": ["getResponsesByCriteriaCode"],
  "4.2.1": ["getResponsesByCriteriaCode"],
  "4.2.2": ["createResponse422","updateResponse422","deleteResponse422","score422"],
  "4.2.3": ["createResponse423","updateResponse423","deleteResponse423","score423"],
  "4.2.4": ["createResponse424","updateResponse424","deleteResponse424","score424"],
  "4.3.1": ["getResponsesByCriteriaCode"],
  "4.3.2": ["createResponse432","updateResponse432","deleteResponse432","score432"],
  "4.3.3": ["createResponse433","updateResponse433","deleteResponse433","score433"],
  "4.3.4": ["getResponsesByCriteriaCode"],
  "4.4.1": ["createResponse414_441","updateResponse414_441","deleteResponse414_441","score441"],
  "4.4.2": ["getResponsesByCriteriaCode"],
  "4.x": ["getResponsesByCriteriaCode"],

  // CRITERIA 5
  "5.1.1": ["createResponse511_512","updateResponse511_512","deleteResponse511_512","score511"],
  "5.1.2": ["createResponse511_512","updateResponse511_512","deleteResponse511_512","score512"],
  "5.1.3": ["createResponse513","updateResponse513","deleteResponse513","score513"],
  "5.1.4": ["createResponse514","updateResponse514","deleteResponse514","score514"],
  "5.1.5": ["createResponse515","updateResponse515","deleteResponse515","score515"],
  "5.2.1": ["createResponse521","updateResponse521","deleteResponse521","score521"],
  "5.2.2": ["createResponse522","updateResponse522","deleteResponse522","score522"],
  "5.2.3": ["createResponse523","updateResponse523","deleteResponse523","score523"],
  "5.3.1": ["createResponse531","updateResponse531","deleteResponse531","score531"],
  "5.3.3": ["createResponse533","updateResponse533","deleteResponse533","score533"],
  "5.4.2": ["createResponse542","updateResponse542","deleteResponse542","score542"],
  "5.x": ["getResponsesByCriteriaCode"],

  // CRITERIA 6
  "6.1.1": ["getResponsesByCriteriaCode"],
  "6.1.2": ["getResponsesByCriteriaCode"],
  "6.2.1": ["getResponsesByCriteriaCode"],
  "6.2.2": ["getResponsesByCriteriaCode"],
  "6.2.3": ["createResponse623","updateResponse623","deleteResponse623","score623"],
  "6.3.1": ["createResponse632","updateResponse632","deleteResponse632","score632"],
  "6.3.2": ["createResponse632","updateResponse632","deleteResponse632","score632"],
  "6.3.3": ["createResponse633","updateResponse633","deleteResponse633","score633"],
  "6.3.4": ["createResponse634","updateResponse634","deleteResponse634","score634"],
  "6.3.5": ["getResponsesByCriteriaCode"],
  "6.4.1": ["getResponsesByCriteriaCode"],
  "6.4.2": ["createResponse642","updateResponse642","deleteResponse642","score642"],
  "6.4.3": ["getResponsesByCriteriaCode"],
  "6.5.1": ["getResponsesByCriteriaCode"],
  "6.5.2": ["getResponsesByCriteriaCode"],
  "6.5.3": ["createResponse653","updateResponse653","deleteResponse653","score653"],
  "6.x": ["getResponsesByCriteriaCode","getAllCriteria6"],

  // CRITERIA 7
  "7.1.1": ["getResponsesByCriteriaCode"],
  "7.1.2": ["createResponse712","score712","deleteResponse712"],
  "7.1.3": ["getResponsesByCriteriaCode"],
  "7.1.4": ["createResponse714","score714","deleteResponse714"],
  "7.1.5": ["createResponse715","score715","deleteResponse715"],
  "7.1.6": ["createResponse716","score716","deleteResponse716"],
  "7.1.7": ["createResponse717","score717","deleteResponse717"],
  "7.1.8": ["getResponsesByCriteriaCode"],
  "7.1.9": ["getResponsesByCriteriaCode"],
  "7.1.10": ["createResponse7110","score7110","deleteResponse7110"],
  "7.1.11": ["getResponsesByCriteriaCode"],
  "7.2.1": ["getResponsesByCriteriaCode"],
  "7.x": ["getResponsesByCriteriaCode"]
};
