#include "IPistonEngineIgnitionConfig.h"
#include "IDecoder.h"
#include "IBooleanInputService.h"
#include "Packed.h"

using namespace Decoder;
using namespace IOService;

#if !defined(PISTONENGINEIGNITIONCONFIG_STATIC_H) && defined(IPISTONENGINEIGNITIONCONFIG_H)
#define PISTONENGINEIGNITIONCONFIG_STATIC_H
namespace EngineManagement
{
	PACK(
	struct PistonEngineIgnitionConfig_StaticConfig
	{
	private:
		PistonEngineIgnitionConfig_StaticConfig()
		{

		}
	public:
		static PistonEngineIgnitionConfig_StaticConfig *Cast(void *p)
		{
			return (PistonEngineIgnitionConfig_StaticConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(PistonEngineIgnitionConfig_StaticConfig);
		}

		float IgnitionDwellTime;
		short IgnitionAdvance64thDegree;
	});

	class PistonEngineIgnitionConfig_Static : public IPistonEngineIgnitionConfig
	{
	protected:
		PistonEngineIgnitionConfig_StaticConfig *_config;
		IgnitionTiming _ignitionTiming;
	public:
		PistonEngineIgnitionConfig_Static(PistonEngineIgnitionConfig_StaticConfig *config);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif