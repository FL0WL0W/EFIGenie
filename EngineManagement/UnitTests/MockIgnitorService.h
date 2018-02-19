namespace EngineManagement
{
	class MockIgnitorService : public IIgnitorService
	{
	public:
		MOCK_METHOD0(CoilDwell, void());
		MOCK_METHOD0(CoilFire, void());
	};
}