#include "Operations/Operation_CylinderAirMass_SD.h"
#include "Config.h"

#ifdef OPERATION_CYLINDERAIRMASS_SD
namespace OperationArchitecture
{
	Operation_CylinderAirMass_SD::Operation_CylinderAirMass_SD(const float cylinderVolume) : _cylinderVolume(cylinderVolume) { }
	
	float Operation_CylinderAirMass_SD::Execute(float cylinderAirTemperature, float manifoldAbsolutePresssure, float volumetricEfficieny)
	{
		//PV=nRT => n = PV/RT
		//R = 0.083144621 L bar/K mol 

		const float n = (manifoldAbsolutePresssure * _cylinderVolume * volumetricEfficieny) / (0.083144621f * (cylinderAirTemperature + 273.15f));

		//the molecular weight of dry air is 28.9647 grams per mole.

		return n * 28.9647f;
	}
	
	IOperationBase *Operation_CylinderAirMass_SD::Create(const void *config, size_t &sizeOut)
	{
		return new Operation_CylinderAirMass_SD(Config::CastAndOffset<float>(config, sizeOut));
	}
}
#endif