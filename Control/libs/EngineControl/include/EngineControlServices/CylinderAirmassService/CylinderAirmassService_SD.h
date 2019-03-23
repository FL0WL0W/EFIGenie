#include "EngineControlServices/AfrService/IAfrService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"
#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "Interpolation.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"

using namespace IOServices;
using namespace Reluctor;
using namespace Interpolation;

#if !defined(CYLINDERAIRMASSSERVICE_SD_H) && defined(ICYLINDERAIRMASSSERVICE_H) && defined(ICYLINDERAIRTEMPERATURESERVICE_H) && defined(RPMSERVICE_H)
#define CYLINDERAIRMASSSERVICE_SD_H
namespace EngineControlServices
{	
	PACK(
	struct CylinderAirmassService_SDConfig
	{
	private:
		CylinderAirmassService_SDConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(CylinderAirmassService_SDConfig) +
				sizeof(unsigned short) * VeRpmResolution * VeMapResolution;
		}
		constexpr const unsigned short *VolumetricEfficiencyMap() const { return reinterpret_cast<const unsigned short *>(this + 1); }
		
		unsigned char Cylinders;
		unsigned short Ml8thPerCylinder;
		
		unsigned short MaxRpm;
		float MaxMap;
		unsigned char VeRpmResolution;
		unsigned char VeMapResolution;
	});
	
	class CylinderAirmassService_SD : public ICylinderAirmassService
	{
	protected:
		const CylinderAirmassService_SDConfig *_config;
		RpmService *_rpmService;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatInputService *_intakeAirTemperatureService;
		IFloatInputService *_engineCoolantTemperatureService;
		ICylinderAirTemperatureService *_cylinderAirTemperatureService;
		
	public:
		CylinderAirmassService_SD(
			const CylinderAirmassService_SDConfig *config, 
			RpmService *rpmService,
			IFloatInputService *manifoldAbsolutePressureService,
			IFloatInputService *intakeAirTemperatureService,
			IFloatInputService *engineCoolantTemperatureService,
			ICylinderAirTemperatureService *cylinderAirTemperatureService);
		void CalculateAirmass() override;
	};
}
#endif