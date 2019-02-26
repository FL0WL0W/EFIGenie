#include "IFloatInputService.h"

#if !defined(FLOATINPUTSERVICE_STATIC_H) && defined(IFLOATINPUTSERVICE_H)
#define FLOATINPUTSERVICE_STATIC_H
namespace IOServices
{
	class FloatInputService_Static : public IFloatInputService
	{
	public:
		FloatInputService_Static(const float value, const float valueDot) { Value = value; ValueDot = valueDot; }
		
		void ReadValue() override { };
	};
}
#endif
