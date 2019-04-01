#include "EngineControlServices/AfrService/IAfrService.h"
#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"
#include "EngineControlServices/CylinderAirmassService/ICylinderAirmassService.h"
#include "Interpolation.h"
#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"
#include "stdlib.h"

using namespace Interpolation;

#if !defined(INJECTORGRAMSERVICE_H) && defined(IINJECTORGRAMSERVICE_H) && defined(IAFRSERVICE_H) && defined(ICYLINDERAIRMASSSERVICE_H)
#define INJECTORGRAMSERVICE_H
namespace EngineControlServices
{	
	PACK(
	struct InjectorGramServiceConfig
	{
	private:
		InjectorGramServiceConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(InjectorGramServiceConfig)
				+ sizeof(float) * Injectors;
		}
		constexpr const uint8_t *InjectorToCylinder() const { return reinterpret_cast<const uint8_t *>(this + 1); }

		uint8_t Injectors;
	});
	
class InjectorGramService : public IInjectorGramService
	{
	protected:
		const InjectorGramServiceConfig *_config;
		ICylinderAirmassService *_cylinderArmassService;
		IAfrService *_afrService;
		IFuelTrimService *_fuelTrimService;
		
	public:
		InjectorGramService(
			const InjectorGramServiceConfig *config, 
			ICylinderAirmassService *cylinderArmassService,
			IAfrService *afrService,
			IFuelTrimService *fuelTrimService);
		void CalculateInjectorGrams() override;
	};
}
#endif