#include "EngineControlServices/IgnitionService/IIgnitionConfig.h"
#include "Reluctor/IReluctor.h"
#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "Packed.h"

using namespace Reluctor;
using namespace IOServices;

#if !defined(IGNITIONCONFIG_STATIC_H) && defined(IIGNITIONCONFIG_H)
#define IGNITIONCONFIG_STATIC_H
namespace EngineControlServices
{
	PACK(
	struct IgnitionConfig_StaticConfig
	{
	private:
		IgnitionConfig_StaticConfig()
		{

		}
	public:
		const unsigned int Size() const
		{
			return sizeof(IgnitionConfig_StaticConfig);
		}

		float IgnitionDwellTime;
		short IgnitionAdvance64thDegree;
	});

	class IgnitionConfig_Static : public IIgnitionConfig
	{
	protected:
		const IgnitionConfig_StaticConfig *_config;
		IgnitionTiming _ignitionTiming;
	public:
		IgnitionConfig_Static(const IgnitionConfig_StaticConfig *config);
		IgnitionTiming GetIgnitionTiming();
	};
}
#endif