#include "IPistonEngineInjectionConfig.h"

#if !defined(PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H) && defined(IPISTONENGINEINJECTIONCONFIG_H)
#define PISTONENGINEINJECTIONCONFIGWRAPPER_DFCO_H
namespace EngineManagement
{
	class PistonEngineInjectionConfigWrapper_DFCO : public IPistonEngineInjectionConfig
	{
	protected:
		IPistonEngineInjectionConfig *_child;
		float _tpsEnable;
		unsigned short _rpmEnable;
		unsigned short _rpmDisable;
		bool _dfcoEnabled;
	public:
		PistonEngineInjectionConfigWrapper_DFCO(
			void *config);
		InjectorTiming GetInjectorTiming(unsigned char cylinder);
	};
}
#endif