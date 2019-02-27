#include "IFloatInputService.h"
#include "Packed.h"

#if !defined(FLOATINPUTSERVICE_FAULTDETECTIONWRAPPER_H) && defined(IFLOATINPUTSERVICE_H)
#define FLOATINPUTSERVICE_FAULTDETECTIONWRAPPER_H
namespace IOServices
{
	PACK(
	struct FloatInputService_FaultDetectionWrapperConfig
	{
	public:
		constexpr const uint32_t Size() const
		{
			return sizeof(FloatInputService_FaultDetectionWrapperConfig);
		}
		
		float MinValue;
		float MaxValue;
		float DefaultValue;
	});
	
	class FloatInputService_FaultDetectionWrapper : public IFloatInputService
	{
	protected:
		const FloatInputService_FaultDetectionWrapperConfig *_config;
		IFloatInputService *_child;
	public:
		FloatInputService_FaultDetectionWrapper(const FloatInputService_FaultDetectionWrapperConfig *config, IFloatInputService *child);

		void ReadValue() override;
	};
}
#endif
