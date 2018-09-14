#include "EngineManagementServices/IgnitionService/IIgnitionConfig.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "Packed.h"

using namespace CrankCamDecoders;
using namespace IOServices;

#if !defined(IGNITIONCONFIG_STATIC_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIG_STATIC_H
namespace EngineManagementServices
{
	PACK(
	struct IgnitionConfig_StaticConfig
	{
	private:
		IgnitionConfig_StaticConfig()
		{

		}
	public:
		static IgnitionConfig_StaticConfig *Cast(void *p)
		{
			return (IgnitionConfig_StaticConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(IgnitionConfig_StaticConfig);
		}

		float IgnitionDwellTime;
		short IgnitionAdvance64thDegree;
	});

	class IgnitionConfig_Static : public IIgnitionConfig
	{
	protected:
		IgnitionConfig_StaticConfig *_config;
		IgnitionTiming _ignitionTiming;
	public:
		IgnitionConfig_Static(IgnitionConfig_StaticConfig *config);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif