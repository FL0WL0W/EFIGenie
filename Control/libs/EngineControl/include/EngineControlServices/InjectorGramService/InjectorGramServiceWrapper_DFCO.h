#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "Packed.h"

using namespace Reluctor;
using namespace IOServices;

#if !defined(INJECTORGRAMSERVICEWRAPPER_DFCO_H) && defined(IINJECTORGRAMSERVICE_H)
#define INJECTORGRAMSERVICEWRAPPER_DFCO_H
namespace EngineControlServices
{
	PACK(
	struct InjectorGramServiceWrapper_DFCOConfig
	{
	private:
		InjectorGramServiceWrapper_DFCOConfig()
		{

		}
	public:
		constexpr const unsigned int Size() const
		{
			return sizeof(InjectorGramServiceWrapper_DFCOConfig);
		}

		float TpsThreshold;
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	});

	class InjectorGramServiceWrapper_DFCO : public IInjectorGramService
	{
	protected:
		const InjectorGramServiceWrapper_DFCOConfig *_config;
		IFloatInputService *_throttlePositionService;
		RpmService *_rpmService;
		IInjectorGramService *_child;
		bool _dfcoEnabled;
	public:
		InjectorGramServiceWrapper_DFCO(const InjectorGramServiceWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, RpmService *rpmService, IInjectorGramService *child);
		void CalculateInjectorGrams() override;
	};
}
#endif