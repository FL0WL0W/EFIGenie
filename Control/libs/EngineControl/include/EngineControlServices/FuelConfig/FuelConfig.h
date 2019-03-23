#include "EngineControlServices/AfrService/IAfrService.h"
#include "EngineControlServices/FuelConfig/IFuelConfig.h"
#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "Interpolation.h"
#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"

using namespace Interpolation;

#if !defined(FUELCONFIG_H) && defined(IFUELCONFIG_H) && defined(IAFRSERVICE_H) && defined(ICYLINDERAIRMASSSERVICE_H)
#define FUELCONFIG_H
namespace EngineControlServices
{	
	PACK(
	struct FuelConfigConfig
	{
	private:
		FuelConfigConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(FuelConfigConfig);
		}
		constexpr const unsigned char *InjectorToCylinder() const { return reinterpret_cast<const unsigned char *>(this + 1); }

		unsigned char Injectors;
	});
	
class FuelConfig : public IFuelConfig
	{
	protected:
		const FuelConfigConfig *_config;
		ICylinderAirmassService *_cylinderArmassService;
		IAfrService *_afrService;
		IFuelTrimService *_fuelTrimService;
		
	public:
		FuelConfig(
			const FuelConfigConfig *config, 
			ICylinderAirmassService *cylinderArmassService,
			IAfrService *afrService,
			IFuelTrimService *fuelTrimService);
		float GetFuelGrams(unsigned char injector);
	};
}
#endif