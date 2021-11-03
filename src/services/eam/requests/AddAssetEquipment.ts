const request = `<?xml version="1.0" encoding="utf-8"?>
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Header>
      <Tenant>DS_MP_1</Tenant>
      <SessionScenario xmlns="http://schemas.datastream.net/headers">terminate</SessionScenario>
      <Organization xmlns="http://schemas.datastream.net/headers">ESS</Organization>
    </Header>
    <Body>
      <MP0301_AddAssetEquipment_001 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" verb="Add" noun="AssetEquipment" version="001" confirm_availability_status="confirm_availability_status1" confirmaddlinearreferences="confirmaddlinearreferences1" confirmnewequipmentlength="confirmnewequipmentlength1" xmlns="http://schemas.datastream.net/MP_functions/MP0301_001">     
        <AssetEquipment recordid="1" user_entity="user_entity1" system_entity="system_entity1" autonumber="default" creategis="true" has_department_security="has_1" has_readonly_department_security_for_createwo="has_1" is_gis_webservice_request="false" is_associated_to_current_consist="false" is_default_rankings_available="false" instructure="false" haswo="false" confirm_delete_surveryanswers="confirmed" xmlns="http://schemas.datastream.net/MP_entities/AssetEquipment_001">
          <ASSETID xmlns="http://schemas.datastream.net/MP_fields">
            <EQUIPMENTCODE></EQUIPMENTCODE>
            <ORGANIZATIONID entity="User">
              <ORGANIZATIONCODE>ESS</ORGANIZATIONCODE>            
            </ORGANIZATIONID>
            <DESCRIPTION>Description</DESCRIPTION>
          </ASSETID>
          <TYPE entity="User" xmlns="http://schemas.datastream.net/MP_fields">
            <TYPECODE>A</TYPECODE>          
          </TYPE>
          <CLASSID entity="ent1" xmlns="http://schemas.datastream.net/MP_fields">
            <CLASSCODE>*</CLASSCODE>
            <ORGANIZATIONID entity="Organization">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>            
            </ORGANIZATIONID>          
          </CLASSID>
          <STATUS entity="User" xmlns="http://schemas.datastream.net/MP_fields">
            <STATUSCODE>I</STATUSCODE>          
          </STATUS>
          <DEPARTMENTID xmlns="http://schemas.datastream.net/MP_fields">
            <DEPARTMENTCODE>*</DEPARTMENTCODE>
            <ORGANIZATIONID entity="Group">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>            
            </ORGANIZATIONID>          
          </DEPARTMENTID>       
          <COMMISSIONDATE qualifier="ACCOUNTING" xmlns="http://schemas.datastream.net/MP_fields">
            <YEAR xmlns="http://www.openapplications.org/oagis_fields">2021</YEAR>
            <MONTH xmlns="http://www.openapplications.org/oagis_fields">02</MONTH>
            <DAY xmlns="http://www.openapplications.org/oagis_fields">10</DAY>
            <HOUR xmlns="http://www.openapplications.org/oagis_fields">10</HOUR>
            <MINUTE xmlns="http://www.openapplications.org/oagis_fields">00</MINUTE>
            <SECOND xmlns="http://www.openapplications.org/oagis_fields">00</SECOND>
            <SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">00</SUBSECOND>
            <TIMEZONE xmlns="http://www.openapplications.org/oagis_fields"></TIMEZONE>
          </COMMISSIONDATE>       
        </AssetEquipment>
      </MP0301_AddAssetEquipment_001>
    </Body>
  </Envelope>`;

export default request;
