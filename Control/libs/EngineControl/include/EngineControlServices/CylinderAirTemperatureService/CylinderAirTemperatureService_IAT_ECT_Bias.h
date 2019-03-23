#include "EngineControlServices/AfrService/IAfrService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "EngineControlServices/CylinderAirTemperatureService/ICylinderAirTemperatureService.h"
#include "Interpolation.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"

using namespace IOServices;
using namespace Reluctor;
using namespace Interpolation;

#if !defined(CYLINDERAIRMASSSERVICE_IAT_ECT_BIAS_H) && defined(ICYLINDERAIRTEMPERATURESERVICE_H) && defined(ICYLINDERAIRMASSSERVICE_H) && defined(RPMSERVICE_H)
#define CYLINDERAIRMASSSERVICE_IAT_ECT_BIAS_H
namespace EngineControlServices
{	
	PACK(
	struct CylinderAirTemperatureService_IAT_ECT_BiasConfig
	{
	private:
		CylinderAirTemperatureService_IAT_ECT_BiasConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(CylinderAirTemperatureService_IAT_ECT_BiasConfig) +
				sizeof(unsigned char) * TemperatureBiasResolution;
		}
		constexpr const unsigned char *TemperatureBias() const { return reinterpret_cast<const unsigned char *>(this + 1); }

		unsigned char Cylinders;

		unsigned char TemperatureBiasResolution;
		float MaxTemperatureBias;
	});
	
	class CylinderAirTemperatureService_IAT_ECT_Bias : public ICylinderAirTemperatureService
	{
	protected:
		const CylinderAirTemperatureService_IAT_ECT_BiasConfig *_config;
		RpmService *_rpmService;
		IFloatInputService *_intakeAirTemperatureService;
		IFloatInputService *_engineCoolantTemperatureService;
		//this is a circular dependency but this value is circularly dependent soooo
		ICylinderAirmassService *_cylinderAirmassService;
		
	public:
		CylinderAirTemperatureService_IAT_ECT_Bias(
			const CylinderAirTemperatureService_IAT_ECT_BiasConfig *config, 
			RpmService *rpmService,
			IFloatInputService *intakeAirTemperatureService,
			IFloatInputService *engineCoolantTemperatureService);
		void SetCylinderAirmassService(ICylinderAirmassService *cylinderAirmassService);
		void CalculateAirTemperature() override;
	};
}
#endif