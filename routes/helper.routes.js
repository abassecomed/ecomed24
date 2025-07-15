var express = require("express");
var router = express.Router();
const VerifyToken = require("./VerifyToken");

const helperController = require("../controllers/helper.controller");
router.get("/get-patients", VerifyToken, helperController.getPatients);
router.get("/get-doctors", VerifyToken, helperController.getDoctorsList);
router.get("/get-doctors-list/:service_id", VerifyToken, helperController.getDoctorsListByServiceID);
router.get("/get-services", VerifyToken, helperController.getServicesList);
router.get("/chart-account", VerifyToken, helperController.getChartAccount);

// Country
router.get("/get-country-list", VerifyToken, helperController.getCountryList);
router.get(
  "/get-region-list/:country_id",
  VerifyToken,
  helperController.getRegionList
);
router.get(
  "/get-district-list/:region_id",
  VerifyToken,
  helperController.getDistrictList
);

//Get organization Permissions
router.get(
  "/get-permissions",
  VerifyToken,
  helperController.getOrganizationPermission
);

router.post(
  "/get-doctor-signature",
  VerifyToken,
  helperController.getDoctorSignature
);

router.post("/generate-pdf", VerifyToken, helperController.generatePDF);
router.post("/send-document", VerifyToken, helperController.sendDocument);
//Get visit-reason
router.get("/get-visit-reason", VerifyToken, helperController.getvisitReason);
router.post("/add-visit-reason", VerifyToken, helperController.addVisitReason);

router.get("/get-urgency-level", VerifyToken, helperController.geturgencyLevel);
router.get(
  "/get-target-organisationtype",
  VerifyToken,
  helperController.gettargetOrganisationType
);
router.get(
  "/get-target-servicetype",
  VerifyToken,
  helperController.gettargetServiceType
);

router.get(
  "/get-transportation-mean",
  VerifyToken,
  helperController.gettransportationMean
);
router.get("/get-care-person", VerifyToken, helperController.getcarePerson);
router.get(
  "/get-ouverture-des-yeux",
  VerifyToken,
  helperController.getOuverturedesyeux
);
router.get(
  "/get-reponse-verbale",
  VerifyToken,
  helperController.getReponseverbale
);
router.get(
  "/get-reponse-motrice",
  VerifyToken,
  helperController.getReponsemotrice
);

router.get("/get-evolutions", VerifyToken, helperController.getEvolutions);

module.exports = router;
