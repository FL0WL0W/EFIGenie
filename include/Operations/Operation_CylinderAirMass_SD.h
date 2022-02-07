#include "Operations/IOperation.h"

#ifndef OPERATION_CYLINDERAIRMASS_SD
#define OPERATION_CYLINDERAIRMASS_SD
namespace EFIGenie
{	
	class Operation_CylinderAirMass_SD : public OperationArchitecture::IOperation<float, float, float, float>
	{
	protected:
		float _cylinderVolume;
	public:
		Operation_CylinderAirMass_SD(const float cylinderVolume);

		float Execute(float cylinderAirTemperature, float manifoldAbsolutePressure, float VolumetricEfficiency) override;
		
		static OperationArchitecture::IOperationBase *Create(const void *config, size_t &sizeOut);
	};
}
#endif