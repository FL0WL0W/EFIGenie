namespace EngineManagement
{
	class MockSensorService : public ISensorService
	{
	public:
		MOCK_METHOD0(ReadValue, void());
	};
}